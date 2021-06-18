import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';

import UserRouter from './server/routes/userRoute';

const app = express();

dotenv.config();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1', UserRouter);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Connected on port: ${port}`);
});
