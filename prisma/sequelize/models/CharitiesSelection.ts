import { Sequelize, Model, DataTypes, ModelCtor } from 'sequelize';

export class CharitiesSelection extends Model {
  static initialize(sequelize: Sequelize) {
    this.init(
      {
        charitiesSelectionId: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
      },
      {
        sequelize,
        modelName: 'CharitiesSelection',
        tableName: 'CharitiesSelection',
        timestamps: true,
      }
    );
  }

  static associate(models: Record<string, ModelCtor<Model>>) {
    this.belongsToMany(models.Charity, {
      through: models._CharitiesSelectionToCharity,
      foreignKey: 'A',
    });
  }
}
