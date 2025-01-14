const fs = require('fs/promises');
const xlsx = require('xlsx');
const Transaction = require("../models/Transaction");
const { Responses, transactionsResponses } = require("../responses");
const { hebrewMonths, filterDataByHebrewMonth } = require("../utils/MonthsFilter");
const { getUsdToIlsRate, parseCurrency, headerMapping, robustNormalize } = require('../utils/xlsx');

const success = Responses.success;
const error = Responses.internalError;

// TODO: Check if you need this function.
exports.getAllTransactions = async (req) => {
    try
    {
        const transactions = await Transaction.find({});

        const { code, message } = success;
        return { code, message, transactions };
    }
    catch(err)
    {
        const { code } = error;
        console.error(err.message);
        return { code, message: err.message };
    }
};

exports.getTransactionsById = async (req) => {
    try
    {
        const { user } = req;
        const transactions = await Transaction.find({ userId: user._id });

        const { code, message } = success;
        return { code, message, transactions };
    }
    catch(err)
    {
        const { code } = error;
        console.error(err.message);
        return { code, message: err.message };
    }
};

exports.getTransactionsByMonth = async (req) => {
    try
    {
        const { user } = req;
        const { month } = req.params;

        if (!hebrewMonths[month]) 
        {
            const { code, message } = transactionsResponses.invalidMonth;
            return { code, message }; 
        }

        const transactions = await Transaction.find({ userId: user._id });

        if (!transactions || transactions.length === 0)
        {
            const { code, message } = transactionsResponses.monthlyTransactionsNotFound;
            return { code, message };
        }

        const monthlyTransactions = await filterDataByHebrewMonth(transactions, month);

        if (!monthlyTransactions || monthlyTransactions.length === 0) 
        {
            const { code, message } = transactionsResponses.monthlyTransactionsNotFound;
            return { code, message, transactions: [] };
        }

        const totalTransactions = monthlyTransactions.reduce((acc, number) => acc + number.amount, 0);


        const { code, message } = success;
        return { code, message, transactions: monthlyTransactions, total: totalTransactions };
    }
    catch(err)
    {
        const { code } = error;
        console.error(err.message);
        return { code, message: err.message };
    }
};

exports.newTransaction = async (req) => {
    try
    {
        const { user } = req;
        const newTransaction = req.body; 
      
        const transaction = await new Transaction({ ...newTransaction, userId: user._id }).save();
        
        const { code, message } = success;
        return { code, message, transaction };
    }
    catch(err)
    {
        const { code } = error;
        console.error(err.message);
        return { code, message: err.message };
    }
};

exports.editTransaction = async (req) => {
    try
    {
        const { user } = req;
        const { id } = req.params;
        const updatedTransaction = req.body;

        // TODO: Check if runValidators  work properly.
        const transaction = await Transaction.findOneAndUpdate(
            { 
                _id: updatedTransaction._id,
                 userId: user._id 
            },
            updatedTransaction,
            { new: true, runValidators: true }
        );

        if (!transaction) 
        {
            const { code, message } = transactionsResponses.transactionNotFound;
            return { code, message };
        }
        
        const { code, message } = success;
        return { code, message, transaction };
    }
    catch(err)
    {
        const { code } = error;
        console.error(err.message);
        return { code, message: err.message };
    }
};

exports.deleteTransaction = async (req) => {
    try
    {
        const { user } = req;
        const { id } = req.params;
      
        const deletedTransaction = await Transaction.findOneAndDelete({ _id: id, userId: user._id });

        if (!deletedTransaction)
        {
            const { code, message } = transactionsResponses.transactionNotFound;
            return { code, message };
        }

        const { code, message } = success;
        return { code, message };
    }
    catch(err)
    {
        const { code } = error;
        console.error(err.message);
        return { code, message: err.message };
    }
};

exports.transactionFile = async (req) => {
    try {
      const { user, file } = req;
  
      // 1. Validate user
      if (!user || !user._id) throw new Error("User not authenticated");
  
      // 2. Validate file
      if (!file) return { code: 400, message: "No file uploaded" };
  
      // 3. Read the XLSX file
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
  
      // 4. Extract headers from row 4 (Excel row 5)
      const rawHeaders = xlsx.utils.sheet_to_json(worksheet, { header: 1 })[4];
      if (!rawHeaders) 
      {
        await fs.unlink(file.path);
        return { code: 400, message: "Header row not found or empty." };
      }
  
      // 5. Clean the headers
      const cleanedHeaders = rawHeaders.map((header) => header ? header.replace(/\r\n/g, " ").trim() : null);
  
      // 6. Map headers
      const headers = cleanedHeaders.map((header) => headerMapping[header] || null);
  
      // 7. Parse the sheet into JSON
      const jsonTransactions = xlsx.utils.sheet_to_json(worksheet, {
        header: headers,
        range: 6, // data starts at Excel row 7
        defval: null,
        blankrows: false,
        skipHidden: true,
        rawNumbers: true,
        raw: false,
        dateNF: "YYYY-MM-DD",
      });
  
      // 8. Fetch the USD→ILS rate **once** (performance optimization)
      const usdToIlsRate = await getUsdToIlsRate();
  
      // 9. Transform each row & parse currency
      const transactions = [];
      for (const row of jsonTransactions) 
    {
        const chargedAmountIls = await parseCurrency(row.chargedAmount, usdToIlsRate);
        const amountIls = await parseCurrency(row.amount, usdToIlsRate);
  
        transactions.push({
          userId: user._id,
          transactionDate: row.transactionDate || null,
          businessName: row.businessName || null,
          chargedAmount: chargedAmountIls, // final ILS as number
          amount: amountIls,               // final ILS as number
          chargeDate: row.chargeDate || null,
          transactionType: row.transactionType || null,
          notes: row.notes || null,
          category: row.category || null,
        });
      }
  
      // 10. Bulk upsert 
      const bulkOps = transactions.map((t) => {
        // define the filter that treats identical fields as duplicates
        const filter = {
          userId: t.userId,
          transactionDate: t.transactionDate,
          businessName: t.businessName,
          chargedAmount: t.chargedAmount,
          chargeDate: t.chargeDate,
          amount: t.amount,
          transactionType: t.transactionType,
          category: t.category,
          notes: t.notes,
        };
  
        return {
          updateOne: {
            filter,
            update: { $set: t },
            upsert: true,
          },
        };
      });
  
      await Transaction.bulkWrite(bulkOps);
  
      // 11. Calculate the total of all `amount` fields for this user
      //     Because `amount` is a string, we convert to double in the pipeline
      const matchUser = { userId: user._id };
      const totals = await Transaction.aggregate([
        { $match: matchUser },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $toDecimal: "$amount" } },
          },
        },
      ]);
  
      totals.length > 0 ? totals[0].totalAmount : 0;
  
      // 12. Retrieve all user transactions (optional)
      const userTransactions = await Transaction.find(matchUser);
      const totalTransactions = userTransactions.reduce((acc, number) => acc + number.amount, 0);
  
      // 13. Clean up the uploaded file
      await fs.unlink(file.path);
  
      // 14. Return
      return {
        code: 200,
        message: "Transactions uploaded & converted successfully.",
        transactions: userTransactions,
        total: totalTransactions
      };
    } 
    catch(err) 
    {
        const { code } = error
        console.error("Error processing transaction file:", err.message);
        return { code, message: err.message };
    }
};


exports.processFile = async (req, res) => {
    try {
      const { file } = req; // File from `multer`
  
      if (!file) return { code: 400, message: "No file uploaded" };
  
      // Read the XLSX file
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
  
      // Get all rows as a 2D array
      const allRows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      if (!allRows || allRows.length === 0) return { code: 400, message: "The file is empty" };
  
      // Identify the header row
      let headerRow = null;
      for (let i = 0; i < allRows.length; i++) {
        const row = allRows[i];
  
        // Check if the row contains potential headers
        const isHeaderRow = row.some(
          (cell) => typeof cell === "string" && cell.trim() !== "" // Non-empty strings
        );
  
        if (isHeaderRow) 
        {
          headerRow = row.map((cell) => (cell ? cell.trim().replace(/\r\n/g, " ") : null));
          break;
        }
      }
  
      if (!headerRow) return { code: 400, message: "No valid header row found in the file" };
  
      // Return the extracted headers
      return {
        code: 200,
        message: "Headers extracted successfully",
        mapping: headerRow,
      };
    } 
    catch(err) 
    {
      console.error("Error extracting headers:", err.message);
      return { code: 500, message: "Failed to extract headers" };
    }
};
  

/**
 * Core logic for processing the Excel file and saving transactions to DB.
 */
// services/transactionService.js

/**
 * Main function that reads the Excel file, detects headers, 
 * maps Hebrew columns to English schema fields, and saves.
 */
// exports.transactionFile = async (req) => {
//   const { user, file } = req;
//   const { mapping } = req.body;

//   // 1) Basic validations
//   if (!user || !user._id) throw new Error("User not authenticated");
//   if (!file) return { code: 400, message: "No file uploaded" };
//   if (!mapping) return { code: 400, message: "Mapping is required" };

//   // 2) Parse mapping JSON
//   let parsedMapping = {};
//   try {
//     parsedMapping = JSON.parse(mapping);
//   } catch (err) {
//     return { code: 400, message: "Invalid JSON in 'mapping' field" };
//   }

//   // 3) Decide if keys are numeric or text-based
//   const allKeys = Object.keys(parsedMapping);
//   const allNumeric = allKeys.every((k) => !isNaN(k));

//   // 4) Read Excel => 2D array
//   const workbook = xlsx.readFile(file.path);
//   const sheetName = workbook.SheetNames[0];
//   const worksheet = workbook.Sheets[sheetName];
//   const allRows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });

//   if (!allRows || allRows.length === 0) {
//     return { code: 400, message: "The file is empty" };
//   }

//   // =============================================
//   // CASE A: Numeric Column Keys => No header row
//   // =============================================
//   if (allNumeric) {
//     const numericKeys = Object.keys(parsedMapping)
//       .map((k) => parseInt(k, 10))
//       .sort((a, b) => a - b);

//     const maxColIndex = Math.max(...numericKeys);
//     const mappedHeaders = new Array(maxColIndex + 1).fill(null);

//     numericKeys.forEach((colIdx) => {
//       mappedHeaders[colIdx] = parsedMapping[colIdx];
//     });

//     // Parse entire sheet from row 0
//     const jsonTransactions = xlsx.utils.sheet_to_json(worksheet, {
//       header: mappedHeaders,
//       range: 0,
//       defval: null,
//       blankrows: false,
//     });

//     // Attach the userId and save
//     const docsToInsert = jsonTransactions.map((tx) => ({
//       ...tx,
//       userId: user._id,
//     }));

//     let dbResult;
//     try {
//       dbResult = await Transaction.insertMany(docsToInsert);
//     } catch (dbErr) {
//       console.error("DB insert error:", dbErr);
//       return { code: 500, message: "Error saving transactions to database" };
//     }

//     return {
//       code: 200,
//       message: "File processed successfully (numeric-column mode)",
//       transactions: dbResult,
//     };
//   }

//   // =============================================
//   // CASE B: Text-based header => Hebrew -> English
//   // =============================================
//   // Build normalizedMapping: e.g. "תאריך עסקה" => "transactionDate"
//   const normalizedMapping = {};
//   for (const rawKey of Object.keys(parsedMapping)) {
//     const normKey = robustNormalize(rawKey);
//     normalizedMapping[normKey] = parsedMapping[rawKey];
//   }

//   // Find the row with the most matches to your Hebrew keys
//   let bestRowIndex = -1;
//   let bestMatchCount = 0;

//   for (let i = 0; i < allRows.length; i++) {
//     const row = allRows[i];
//     if (!Array.isArray(row)) continue;

//     const normalizedCells = row.map(robustNormalize);

//     let matchCount = 0;
//     for (const cell of normalizedCells) {
//       if (cell && normalizedMapping[cell]) {
//         matchCount++;
//       }
//     }

//     if (matchCount > bestMatchCount) {
//       bestMatchCount = matchCount;
//       bestRowIndex = i;
//     }
//   }

//   if (bestRowIndex === -1 || bestMatchCount === 0) {
//     return { code: 400, message: "No valid header row found" };
//   }

//   // Extract & normalize the header row
//   const headerRow = allRows[bestRowIndex];
//   const normalizedHeaders = headerRow.map(robustNormalize);

//   // Convert Hebrew text to the English fields from your schema
//   const mappedHeaders = normalizedHeaders.map((hdr) => {
//     if (hdr && normalizedMapping[hdr]) {
//       return normalizedMapping[hdr]; // e.g. "transactionDate"
//     }
//     return null;
//   });

//   // If no columns mapped, fail
//   if (!mappedHeaders.some((x) => x)) {
//     return { code: 400, message: "No valid headers found for mapping" };
//   }

//   // Parse the rows below the header
//   const jsonTransactions = xlsx.utils.sheet_to_json(worksheet, {
//     header: mappedHeaders,
//     range: bestRowIndex + 1,
//     defval: null,
//     blankrows: false,
//   });

//   // Attach userId and save
//   const docsToInsert = jsonTransactions.map((tx) => ({
//     ...tx,
//     userId: user._id,
//   }));

//   let dbResult;
//   try {
//     dbResult = await Transaction.insertMany(docsToInsert);
//   } catch (dbErr) {
//     console.error("DB insert error:", dbErr);
//     return { code: 500, message: "Error saving transactions to database" };
//   }

//   return {
//     code: 200,
//     message: "File processed successfully (text-based header mode)",
//     transactions: dbResult,
//   };
// }