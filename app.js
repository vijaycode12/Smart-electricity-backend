import express from 'express';
import cors from 'cors';

import { PORT } from './config/env.js';

import authRouter from './routes/auth.routes.js';
import billRouter from './routes/bill.routes.js';
import applianceRouter from './routes/appliance.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import connectToDatabase from './database/mongodb.js';
import cookieParser from 'cookie-parser';
import errorMiddleware from './middleware/error.middleware.js';
import arcjetMiddleware from './middleware/arcjet.middleware.js';


const app = express();

app.use('/public',express.static('public'));
app.use('/upload',express.static('upload'));

const allowedOrigins = [
  'http://localhost:5173',  
  'http://127.0.0.1:5173',
  'http://localhost:4000',
];

app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS Origin:', origin);
    // allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not ' +
                  'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

app.use(arcjetMiddleware);

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/bill',billRouter);
app.use('/api/v1/appliance',applianceRouter);
app.use('/api/v1/analytics',analyticsRouter);

app.use(errorMiddleware);

app.get('/',(req,res)=>{
    res.send('Welcome to Smart electricity tracker');
});

app.listen(PORT,async()=>{
    console.log(`Smart electricity tracker running on port ${PORT}`);

    await connectToDatabase();
});