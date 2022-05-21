import { Sequelize, Model, DataTypes, ModelCtor } from 'sequelize';

export class _CharitiesSelectionToCharity extends Model {
  static initialize(sequelize: Sequelize) {
    this.init(
      {},
      {
        sequelize,
        modelName: '_CharitiesSelectionToCharity',
        tableName: '_CharitiesSelectionToCharity',
        timestamps: false,
      }
    );
  }
}
