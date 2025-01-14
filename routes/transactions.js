const express = require('express');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const { 
    newTransactionController, 
    getTransactionsByIdController, 
    getTransactionsByMonthController, 
    deleteTransactionController, 
    editTransactionController, 
    transactionFileController, 
    processFileHeaderController
} = require('../controllers/transcations');

const router = express.Router();

router.get('/get_transactions_by_month/:month',  getTransactionsByMonthController );
router.get('/get_transactions_by_id',            getTransactionsByIdController    );
router.post('/new_transaction',                  newTransactionController         );
router.put('/edit_transaction',                  editTransactionController        );
router.delete('/delete_transaction/:id',         deleteTransactionController      );

router.post('/extract_headers',  upload.single('file'), processFileHeaderController );
router.post('/transaction_file', upload.single('file'), transactionFileController   );

module.exports = { transactionsRouter: router };
