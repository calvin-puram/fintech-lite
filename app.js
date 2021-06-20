import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';

import UserRouter from './server/routes/userRoute';
import CardRouter from './server/routes/cardRoute';

const app = express();

dotenv.config();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1', UserRouter);
app.use('/api/v1/card', CardRouter);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Connected on port: ${port}`);
});
