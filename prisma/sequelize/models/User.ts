import { Sequelize, Model, DataTypes, ModelCtor } from 'sequelize';

export class User extends Model {
  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        weight: {
          type: DataTypes.FLOAT,
        },
        is18: {
          type: DataTypes.BOOLEAN,
        },
        name: {
          type: DataTypes.STRING,
        },
        successorId: {
          type: DataTypes.INTEGER,
        },
        role: {
          type: DataTypes.ENUM('USER', 'ADMIN'),
          allowNull: false,
          defaultValue: 'USER',
        },
        keywords: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: false,
        },
        biography: {
          type: DataTypes.JSONB,
          allowNull: false,
        },
        amount: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        uid: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
        },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'User',
        timestamps: true,
        updatedAt: false,
      }
    );
  }

  static associate(models: Record<string, ModelCtor<Model>>) {
    this.belongsTo(models.User, {
      as: 'successor',
      targetKey: 'id',
      foreignKey: 'successorId',
    });
    this.hasMany(models.Post, {
      as: 'posts',
      sourceKey: 'id',
      foreignKey: 'userId',
    });
    this.hasOne(models.User, { as: 'predecessor', foreignKey: 'id' });
  }
}
