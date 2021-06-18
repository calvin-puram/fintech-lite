import express from 'express';

import {
  createUser,
  deposit,
  withdraw,
  transfer,
  reversal,
} from '../controllers/userController';

const router = express.Router();

router.post('/user', createUser);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.post('/transfer', transfer);
router.post('/reversal', reversal);

export default router;
