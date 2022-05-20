import { Sequelize, Model, DataTypes, ModelCtor } from 'sequelize';

export class Charity extends Model {
  static initialize(sequelize: Sequelize) {
    this.init(
      {
        charityId: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'Charity',
        tableName: 'Charity',
        timestamps: false,
      }
    );
  }

  static associate(models: Record<string, ModelCtor<Model>>) {
    this.belongsToMany(models.CharitiesSelection, {
      through: '_CharitiesSelectionToCharity',
    });
  }
}
