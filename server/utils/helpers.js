/* eslint-disable import/prefer-default-export */
const model = require('../models');

export const CreditAccount = async ({
  amount,
  accountId,
  reference,
  t,
  res,
  meta,
  purpose,
}) => {
  try {
    const account = await model.account.findOne({
      where: { id: accountId },
      transaction: t,
    });

    if (!account) {
      return res.status(400).json({
        success: false,
        msg: 'Account does not exist',
      });
    }

    await model.account.increment(
      { balance: amount },
      { where: { id: accountId }, transaction: t }
    );

    await model.Transactions.create(
      {
        txn_type: 'credit',
        purpose,
        amount,
        account_id: accountId,
        reference,
        meta,
        balance_before: Number(account.balance),
        balance_after: Number(account.balance) + Number(amount),
      },
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );
  } catch (error) {
    await t.rollback();
    return res.status(400).json({
      success: true,
      message: error.message,
    });
  }
};

export const DebitAccount = async ({
  amount,
  accountId,
  reference,
  t,
  res,
  meta,
  purpose,
}) => {
  try {
    const account = await model.account.findOne({
      where: { id: accountId },
      transaction: t,
    });

    if (!account) {
      return res.status(400).json({
        success: false,
        msg: 'Account does not exist',
      });
    }

    if (Number(account.balance) < amount) {
      return res.status(400).json({
        success: false,
        msg: 'Insufficient balance',
      });
    }

    await model.account.increment(
      { balance: -amount },
      { where: { id: accountId }, transaction: t }
    );

    await model.Transactions.create(
      {
        txn_type: 'debit',
        purpose,
        amount,
        account_id: accountId,
        reference,
        meta,
        balance_before: Number(account.balance),
        balance_after: Number(account.balance) - Number(amount),
      },
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );
  } catch (error) {
    await t.rollback();
    return res.status(400).json({
      success: false,
      msg: error,
    });
  }
};
