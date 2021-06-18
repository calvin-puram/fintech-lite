import bcrypt from 'bcryptjs';
import { v4 } from 'uuid';
import model from '../models';
import {
  validateUser,
  validateAmount,
  TransferAmount,
} from '../utils/validations';
import { CreditAccount, DebitAccount } from '../utils/helpers';

/**
 * @description - Adds a new user to the database
 *
 * @param  {object} req - request object
 *
 * @param  {object} res - response object
 *
 * @return {Object} - Object containing user message
 *
 * Route: POST: /user
 */

export const createUser = async (req, res) => {
  const t = await model.sequelize.transaction();
  try {
    validateUser(req.body.username, req.body.password);

    const existingUser = await model.users.findOne(
      { where: { username: req.body.username } },
      { transaction: t }
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        msg: 'user already exist',
      });
    }

    const user = await model.users.create(
      {
        username: req.body.username,
        password: await bcrypt.hash(req.body.password, 10),
      },
      { transaction: t }
    );

    await model.account.create(
      { user_id: user.id, balance: 0 },
      { transaction: t }
    );

    await t.commit();

    return res.status(200).json({
      success: true,
      msg: 'account successfully created!',
    });
  } catch (error) {
    await t.rollback();
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

/**
 * @description - Deposit money to wallet
 *
 * @param  {object} req - request object
 *
 * @param  {object} res - response object
 *
 * @return {Object} - Object containing user message
 *
 * Route: POST: /deposit
 */

export const deposit = async (req, res) => {
  validateAmount(req.body.accountId, req.body.amount);
  const t = await model.sequelize.transaction();
  try {
    const result = await CreditAccount({
      amount: req.body.amount,
      accountId: req.body.accountId,
      reference: v4(),
      purpose: 'deposit',
      res,
      t,
      meta: {},
    });

    await t.commit();
    return res.status(200).json({
      success: true,
      message: 'Deposit successful',
    });
  } catch (error) {
    await t.rollback();
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

/**
 * @description -Withdraw money from wallet
 *
 * @param  {object} req - request object
 *
 * @param  {object} res - response object
 *
 * @return {Object} - Object containing user message
 *
 * Route: POST: /deposit
 */

export const withdraw = async (req, res) => {
  validateAmount(req.body.accountId, req.body.amount);
  const t = await model.sequelize.transaction();
  try {
    const result = await DebitAccount({
      amount: req.body.amount,
      accountId: req.body.accountId,
      reference: v4(),
      purpose: 'transfer',
      res,
      t,
      meta: {},
    });

    await t.commit();
    return res.status(200).json({
      success: true,
      msg: 'Withdrawal successful',
    });
  } catch (error) {
    await t.rollback();
    return res.status(400).json({
      success: false,
      msg: error,
    });
  }
};

/**
 * @description - Transfer money to user
 *
 * @param  {object} req - request object
 *
 * @param  {object} res - response object
 *
 * @return {Object} - Object containing user message
 *
 * Route: POST: /deposit
 */
export const transfer = async (req, res) => {
  TransferAmount(req.body.senderId, req.body.recipientId, req.body.amount);
  const t = await model.sequelize.transaction();
  try {
    await Promise.all([
      DebitAccount({
        amount: req.body.amount,
        accountId: req.body.senderId,
        reference: v4(),
        purpose: 'transfer',
        res,
        t,
        meta: {
          recipient: req.body.recipientId,
        },
      }),
      CreditAccount({
        amount: req.body.amount,
        accountId: req.body.recipientId,
        reference: v4(),
        res,
        t,
        purpose: 'deposit',
        meta: {
          sender: req.body.senderId,
        },
      }),
    ]);

    await t.commit();
    return res.status(200).json({
      success: true,
      msg: 'transfer sucessful',
    });
  } catch (error) {
    await t.rollback();
    res.status(400).json({
      success: false,
      msg: error,
    });
  }
};

/**
 * @description - Reversal
 *
 * @param  {object} req - request object
 *
 * @param  {object} res - response object
 *
 * @return {Object} - Object containing user message
 *
 * Route: POST: /deposit
 */
export const reversal = async (req, res) => {
  const t = await model.sequelize.transaction();
  try {
    const transactions = await model.Transactions.findAll(
      { where: { reference: req.body.reference } },
      { transaction: t }
    );

    if (transactions.length === 0) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid reference id',
      });
    }

    const transactionArray = transactions.map((transaction) => {
      if (transaction.txn_type === 'debit') {
        return CreditAccount({
          amount: transaction.amount,
          accountId: transaction.account_id,
          reference: v4(),
          res,
          t,
          purpose: 'reversal',
          meta: {
            originalReference: transaction.reference,
          },
        });
      }

      return DebitAccount({
        amount: transaction.amount,
        accountId: transaction.account_id,
        reference: v4(),
        purpose: 'debit',
        res,
        t,
        meta: {
          originalReference: transaction.reference,
        },
      });
    });

    await Promise.all(transactionArray);
    await t.commit();
    return res.status(200).json({
      success: true,
      msg: 'reversal successful',
    });
  } catch (error) {
    await t.commit();
    res.status(400).json({
      success: false,
      msg: error,
    });
  }
};
