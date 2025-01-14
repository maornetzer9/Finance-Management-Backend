// Define the mapping between file headers and schema fields
require('dotenv').config();
const xlsx = require('xlsx');
const axios = require("axios"); // or axios, etc.

const CURRENCY_API = process.env.CURRENCY_REALTIME_API;
const headerMapping = {
    "תאריך עסקה": "transactionDate",
    "שם בית עסק": "businessName",
    "סכום עסקה": "chargedAmount",
    "תאריך חיוב": "chargeDate",
    "סכום חיוב": "amount",
    "סוג עסקה": "transactionType",
    "ענף": "category",
    "הערות": "notes",
  };

// TODO: Move this.
// 1. A helper to get real-time exchange rate in real time.
const getUsdToIlsRate = async () => {
    try 
    {
      const response = await axios.get(CURRENCY_API);
  
      // Extract the rate directly from the response (adjust based on API docs)
      const rate = response.data?.rate; // Ensure `rate` matches the API's response format
      if (!rate) throw new Error("Could not get ILS rate from API response");
  
      return rate.toFixed(2); // e.g., 3.63
    } 
    catch(error) 
    {
      // Log any errors for debugging
      console.error("Error in getUsdToIlsRate:", error.message);
      throw error;
    };
  };
  
/**
 * Parses a string amount that can contain $ (USD) or ₪ (ILS).
 *  - Detects negative sign.
 *  - Cleans out currency symbols and commas.
 *  - Converts to float.
 *  - Uses real-time USD → ILS rate to return both USD and ILS values.
 **/
// 3. Convert a string like "$9.36" or "₪ 100.00" into a numeric ILS value
const parseCurrency = async (val, rate) => {
    if (!val) return null;
  
    // Check for negative
    const isNegative = val.includes("-");
  
    // Remove all non-digit/decimal except dot, comma
    let cleaned = val.replace(/[^0-9.,]/g, "").trim();
  
    // Convert commas to dots
    cleaned = cleaned.replace(",", ".");
  
    // Parse as float
    let floatVal = parseFloat(cleaned);
    if (isNaN(floatVal)) return null;
  
    // Decide USD or ILS
    const isUsd = val.includes("$");
    // If not "$", assume it's already ILS
  
    let ilsAmount;
    if (isUsd) 
    {
      ilsAmount = floatVal * rate; 
    } 
    else 
    {
      ilsAmount = floatVal; 
    }
  
    // Apply negative if needed
    if (isNegative) 
    {
      ilsAmount = -Math.abs(ilsAmount);
    }
  
    // Return as **string** to match your schema
    return ilsAmount.toFixed(2);
  }


// services/transactionService.js

// utils/xlsxUtils.js

/**
 * A robust normalization function to remove hidden characters, newlines, BOM, 
 * zero-width chars, etc., which helps matching headers with the mapping keys.
 */
function robustNormalize(str) {
    if (typeof str !== "string") return null;
    return str
      // Optional: .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[\u200B-\u200F\uFEFF]/g, "") // Remove zero-width, BOM
      .replace(/\r|\n/g, " ")                // Replace CR or LF with a space
      .replace(/\s+/g, " ")                  // Collapse multiple spaces
      .trim();                               // Trim leading/trailing spaces
  }
  
/**
 * Example database logic (placeholder). 
 * Replace with your real DB code, e.g. Mongoose models, etc.
 */
async function saveTransactionsToDatabase(transactions, user) {
  // For example:
  // const result = await TransactionModel.insertMany(transactions);
  // Or upsert, or whatever business logic you need.
  // We'll just return a dummy success here:
  return { insertedCount: transactions.length };
}

const processTransactionFile = async (req) => {
  // 1. Validate request
  const { user, file } = req;
  const { mapping } = req.body;

  if (!user || !user._id) throw new Error("User not authenticated");
  if (!file) return { code: 400, message: "No file uploaded" };
  if (!mapping) return { code: 400, message: "Mapping is required" };

  // 2. Parse the mapping JSON
  let parsedMapping = {};
  try {
    parsedMapping = JSON.parse(mapping);
  } catch (err) {
    return { code: 400, message: "Invalid JSON in 'mapping' field" };
  }

  // 3. Check if the mapping keys are numeric or textual
  const allKeys = Object.keys(parsedMapping);
  const allNumeric = allKeys.every((k) => !isNaN(k)); // e.g. "0", "1", ...

  // 4. Read the file and convert to 2D array
  const workbook = xlsx.readFile(file.path);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const allRows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });

  // Edge case: empty file
  if (!allRows || allRows.length === 0) {
    return { code: 400, message: "The file is empty" };
  }

  // ===========================
  // CASE A: Numeric Column Keys
  // ===========================
  if (allNumeric) {
    // We'll interpret "0", "1", etc. as indexes into each row (no header row).
    const numericKeys = Object.keys(parsedMapping)
      .map((k) => parseInt(k, 10)) // convert "0" -> 0, "1" -> 1, etc.
      .sort((a, b) => a - b);

    const maxColIndex = Math.max(...numericKeys);
    const mappedHeaders = new Array(maxColIndex + 1).fill(null);

    // For example, if "0": "transactionDate", "1": "amount", etc.
    numericKeys.forEach((colIdx) => {
      mappedHeaders[colIdx] = parsedMapping[colIdx];
    });

    // Convert entire sheet starting from row 0
    const jsonTransactions = xlsx.utils.sheet_to_json(worksheet, {
      header: mappedHeaders,
      range: 0,
      defval: null,
      blankrows: false,
    });

    // (Optional) Save to DB or do further logic
    const dbResult = await saveTransactionsToDatabase(jsonTransactions, user);

    // Return
    return {
      code: 200,
      message: "File processed successfully (numeric-column mode)",
      transactions: jsonTransactions,
      dbResult,
    };
  }

  // ==============================
  // CASE B: Text-Based Header Keys
  // ==============================
  // Build a normalizedMapping object: 
  // e.g. {"תאריך עסקה": "transactionDate"} => {"תאריך עסקה" (normalized): "transactionDate"}
  const normalizedMapping = {};
  for (const rawKey of Object.keys(parsedMapping)) {
    const normKey = robustNormalize(rawKey);
    normalizedMapping[normKey] = parsedMapping[rawKey];
  }

  // Find the row that best matches these text keys
  let bestRowIndex = -1;
  let bestMatchCount = 0;

  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i];
    if (!Array.isArray(row)) continue;

    // Normalize each cell
    const normalizedCells = row.map(robustNormalize);

    let matchCount = 0;
    for (const cell of normalizedCells) {
      if (cell && normalizedMapping[cell]) {
        matchCount++;
      }
    }

    // Track best row
    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount;
      bestRowIndex = i;
    }
  }

  if (bestRowIndex === -1 || bestMatchCount === 0) {
    console.error("No valid header row found");
    return { code: 400, message: "No valid header row found" };
  }

  // Extract & normalize the chosen header row
  const headerRow = allRows[bestRowIndex];
  const normalizedHeaders = headerRow.map(robustNormalize);

  // Map them
  const mappedHeaders = normalizedHeaders.map((hdr) => {
    return hdr && normalizedMapping[hdr] ? normalizedMapping[hdr] : null;
  });

  // If no columns mapped, fail
  if (!mappedHeaders.some((x) => x)) {
    return { code: 400, message: "No valid headers found for mapping" };
  }

  // Parse the rows below the header
  const jsonTransactions = xlsx.utils.sheet_to_json(worksheet, {
    header: mappedHeaders,
    range: bestRowIndex + 1, // skip the header row
    defval: null,
    blankrows: false,
  });

  // (Optional) Save to DB or do further logic
  const dbResult = await saveTransactionsToDatabase(jsonTransactions, user);

  // Return
  return {
    code: 200,
    message: "File processed successfully (text-based header mode)",
    transactions: jsonTransactions,
    dbResult,
  };
}


  module.exports = { parseCurrency, getUsdToIlsRate, robustNormalize, headerMapping };