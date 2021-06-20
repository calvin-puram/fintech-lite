import express from 'express';

import { charge, submitCardPin } from '../controllers/cardController';

const router = express.Router();

router.post('/charge', charge);
router.post('/charge/send-pin', submitCardPin);

export default router;
