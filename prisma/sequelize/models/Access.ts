import { Sequelize, Model, DataTypes, ModelCtor } from 'sequelize';

export class Access extends Model {
  static initialize(sequelize: Sequelize) {
    this.init(
      {
        accessId: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'Access',
        tableName: 'Access',
        timestamps: true,
      }
    );
  }

  static associate(models: Record<string, ModelCtor<Model>>) {
    this.hasOne(models.AccessCredential, {
      as: 'accessCredential',
      foreignKey: 'accessId',
    });
  }
}
