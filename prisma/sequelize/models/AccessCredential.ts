import { Sequelize, Model, DataTypes, ModelCtor } from 'sequelize';

export class AccessCredential extends Model {
  static initialize(sequelize: Sequelize) {
    this.init(
      {
        accessCredentialId: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        accessId: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        modelName: 'AccessCredential',
        tableName: 'AccessCredential',
        timestamps: true,
      }
    );
  }

  static associate(models: Record<string, ModelCtor<Model>>) {
    this.belongsTo(models.Access, {
      as: 'access',
      targetKey: 'accessId',
      foreignKey: 'accessId',
    });
  }
}
