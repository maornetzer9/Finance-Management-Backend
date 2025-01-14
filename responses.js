// responsesjs
// const Responses = {
//     success: {
//         code: 200,
//         message: "Success",
//     },
//     internalError: {
//         code: 500,
//         message: "Internal server error Please try again later",
//     },
//     unauthorized: {
//         code: 401,
//         message: "Unauthorized Please provide a valid token",
//     },
//     forbidden: {
//         code: 403,
//         message:
//             "Forbidden You do not have permission to access this resource",
//     },
//     notFound: {
//         code: 404,
//         message: "Not found The requested resource could not be found",
//     },
//     sessionExpired: {
//         code: 401,
//         message: "Session expired Please log in again",
//     },
//     invalidInput: {
//         code: 400,
//         message: "Invalid input Please check your data and try again",
//     },
//     conflict: {
//         code: 409,
//         message: "Conflict The resource already exists",
//     },
//     methodNotAllowed: {
//         code: 405,
//         message:
//             "Method not allowed The HTTP method used is not supported for this endpoint",
//     },
//     serviceUnavailable: {
//         code: 503,
//         message: "Service unavailable Please try again later",
//     },
// };

// const sessionResponses = {
//     sessionExpired: {
//         code: 401,
//         message: "Session expired Please log in again",
//     },
// };

// const tokenResponses = {
//     invalidToken       : { code: 401, message: 'Invalid Token' }
// }

// const userResponses = {
//     userAlreadyExists               : { code: 1, message: "User already exists" },
//     userNotFound                    : { code: 2, message: "User not found" },
//     incorrectPassword               : { code: 3, message: "Incorrect password please try again" },
// };


// const expensesResponses = {
//     expenseNotFound            : { code: 1, message: "Expense not found or does not belong to the user" },
//     invalidMonth               : { code: 2, message: 'Invalid month please try again' },
//     monthlyExpensesNotFound    : { code: 3, message: 'You not have expenses on this month' },
// };


// responses.js hebrew
const Responses = {
    success: {
        code: 200,
        message: "הפעולה בוצעה בהצלחה",
    },
    internalError: {
        code: 500,
        message: "שגיאת שרת פנימית. אנא נסה שוב מאוחר יותר",
    },
    unauthorized: {
        code: 401,
        message: "לא מורשה. יש לספק אסימון תקף",
    },
    forbidden: {
        code: 403,
        message: "גישה אסורה. אין לך הרשאה לגשת למשאב זה",
    },
    notFound: {
        code: 404,
        message: "לא נמצא. המשאב המבוקש לא נמצא",
    },
    sessionExpired: {
        code: 401,
        message: "תוקף ההתחברות פג. יש להתחבר מחדש",
    },
    invalidInput: {
        code: 400,
        message: "נתונים שגויים. אנא בדוק את המידע שהוזן ונסה שוב",
    },
    conflict: {
        code: 409,
        message: "קיים כבר. המשאב כבר קיים במערכת",
    },
    methodNotAllowed: {
        code: 405,
        message: "שיטה אינה נתמכת. שיטת ה-HTTP שנבחרה אינה נתמכת עבור נקודת הקצה",
    },
    serviceUnavailable: {
        code: 503,
        message: "השירות אינו זמין כעת. אנא נסה שוב מאוחר יותר",
    },
};

const sessionResponses = {
    sessionExpired: {
        code: 401,
        message: "תוקף ההתחברות פג. יש להתחבר מחדש",
    },
};

const tokenResponses = {
    invalidToken: { 
        code: 401, 
        message: "אסימון שגוי. יש לספק אסימון תקף" 
    },
};

const userResponses = {
    userAlreadyExists: {
        code: 1,
        message: "המשתמש כבר קיים במערכת",
    },
    userNotFound: {
        code: 2,
        message: "המשתמש לא נמצא",
    },
    incorrectPassword: {
        code: 3,
        message: "סיסמה שגויה. אנא נסה שוב",
    },
};

const transactionsResponses = {
    transactionNotFound: {
        code: 1,
        message: "הוצאה לא נמצאה או שאינה שייכת למשתמש",
    },
    invalidMonth: {
        code: 2,
        message: "חודש לא חוקי. אנא נסה שוב",
    },
    monthlyTransactionsNotFound: {
        code: 3,
        message: "אין לך הוצאות עבור החודש הנבחר",
    },
};

const expensesResponses = {
    expenseNotFound: {
        code: 1,
        message: "הוצאה לא נמצאה או שאינה שייכת למשתמש",
    },
    invalidMonth: {
        code: 2,
        message: "חודש לא חוקי. אנא נסה שוב",
    },
    monthlyExpensesNotFound: {
        code: 3,
        message: "אין לך הוצאות עבור החודש הנבחר",
    },
};

const assetsResponses = {
    failedToAddAsset: {
        code: 1,
        message: "הוספת נכס חדש נכשלה, אנא נסה שנית",
    },
    emptyAssets: {
        code: 2,
        message: "עדיין לא עדכנת נכסים במערכת,",
    },
    assetNotFound: {
        code: 3,
        message: "הנכס לא נמצא, אנא נסה שנית",
    },
    editAssetFailure: {
        code: 4,
        message: "הפעולה נכשלה, אנא נסה שנית",
    },
  
};



module.exports = { 
    Responses, 
    sessionResponses, 
    tokenResponses, 
    userResponses, 
    expensesResponses,
    assetsResponses,
    transactionsResponses
};