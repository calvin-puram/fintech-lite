/* eslint-disable import/prefer-default-export */
import axios from 'axios';
import { v4 } from 'uuid';
import model from '../models';

import { CreditAccount } from '../utils/helpers';

export const charge = async (req, res) => {
  const payload = {
    card: {
      number: req.body.number,
      cvv: req.body.cvv,
      expiry_year: req.body.expiry_year,
      expiry_month: req.body.expiry_month,
    },
    email: 'puram.calvin@gmail.com',
    amount: req.body.amount,
  };

  const headers = {
    Authorization: `Bearer ${process.env.PAYSTACK_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const t = await model.sequelize.transaction();

  try {
    const { data } = await axios.post(
      'https://api.paystack.co/charge',
      payload,
      { headers }
    );

    if (data.status === true) {
      await CreditAccount({
        amount: data.data.amount,
        accountId: req.body.accountId,
        reference: v4(),
        res,
        t,
        purpose: 'card-funding',
        meta: {
          external_reference: data.data.reference,
        },
      });

      await model.cardTransaction.create(
        {
          external_reference: data.data.reference,
          amount: data.data.amount,
          account_id: req.body.accountId,
          last_response: 'true',
        },
        { transaction: t }
      );

      await t.commit();

      res.status(200).json({
        success: true,
        msg: 'card charged successfully',
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      msg: err.response.data,
    });
  }
};
