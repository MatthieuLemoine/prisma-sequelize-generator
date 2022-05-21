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
        sustainableDevelopmentGoals: {
          type: DataTypes.ARRAY(
            DataTypes.ENUM(
              'NO_POVERTY',
              'ZERO_HUNGER',
              'GOOD_HEALTH_AND_WELL_BEING',
              'QUALITY_EDUCATION',
              'GENDER_EQUALITY',
              'CLEAN_WATER_AND_SANITATION',
              'AFFORDABLE_AND_CLEAN_ENERGY',
              'DECENT_WORK_AND_ECONOMIC_GROWTH',
              'INDUSTRY_INNOVATION_AND_INFRASTRUCTURE',
              'REDUCED_INEQUALITIES',
              'SUSTAINABLE_CITIES_AND_COMMUNITIES',
              'RESPONSIBLE_CONSUMPTION_AND_PRODUCTION',
              'CLIMATE_ACTION',
              'LIFE_BELOW_WATER',
              'LIFE_ON_LAND',
              'PEACE_JUSTICE_AND_STRONG_INSTITUTIONS',
              'PARTNERSHIPS_FOR_THE_GOALS'
            )
          ),
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'Charity',
        tableName: 'Charity',
        timestamps: true,
      }
    );
  }

  static associate(models: Record<string, ModelCtor<Model>>) {
    this.belongsToMany(models.CharitiesSelection, {
      through: models._CharitiesSelectionToCharity,
      foreignKey: 'B',
    });
  }
}
