const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transactions.belongsTo(models.account);
    }
  }
  Transactions.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      txn_type: {
        allowNull: false,
        type: DataTypes.ENUM('debit', 'credit'),
      },
      purpose: {
        type: DataTypes.ENUM('deposit', 'transfer', 'withdrawal', 'reversal'),
        allowNull: false,
      },
      amount: {
        allowNull: false,
        type: DataTypes.DECIMAL(20, 4),
      },
      account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reference: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      balance_before: {
        allowNull: false,
        type: DataTypes.DECIMAL(20, 4),
      },
      balance_after: {
        allowNull: false,
        type: DataTypes.DECIMAL(20, 4),
      },
      metadata: {
        allowNull: true,
        type: DataTypes.JSON,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Transactions',
    }
  );
  return Transactions;
};
