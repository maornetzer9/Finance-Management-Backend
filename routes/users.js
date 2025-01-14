const express = require('express');
const { loginController, registerController } = require('../controllers/users');

const router = express.Router();

router.post('/register', registerController  );
router.post('/login',    loginController     );

module.exports = { userRouter: router };