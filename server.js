require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { userRouter } = require('./routes/users');
const authMiddleware = require('./middleware/auth');
const mongooseConnection = require('./config/dbConnection');
const { errorMiddleware } = require('./middleware/error');
const { investmentRouter } = require('./routes/investments');
const { assetsRouter } = require('./routes/assets');
const { transactionsRouter } = require('./routes/transactions');

const app = express();
const PORT = 3000;
const CORS_OPTIONS = { 
    origin: process.env.ORIGIN,
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Authorization, Content-Type',
}

mongooseConnection((err) => {
    if (err) 
    {
        console.error('Failed to connect to MongoDB. Shutting down...');
        process.exit(1); 
    } 
    else 
    {
        console.log('Connected to MongoDB successfully!');
        app.listen(PORT, () => console.info(`Server is running on PORT: ${PORT}`));
    }
});

app.use(express.json());
app.use(cors(CORS_OPTIONS));


app.use('/users',           userRouter       );
app.use('/assets',          authMiddleware, assetsRouter     );
app.use('/investments',     authMiddleware, investmentRouter );
app.use('/transactions',    authMiddleware, transactionsRouter   );

app.use(errorMiddleware);