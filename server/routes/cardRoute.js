import express from 'express';

import { charge } from '../controllers/cardController';

const router = express.Router();

router.post('/charge', charge);

export default router;
