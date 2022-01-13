import { Options, Sequelize } from 'sequelize';
import { mergeDeepRight } from 'ramda';
import path from 'path';

import config from './config.json';
import * as models from './models';

const env = process.env;
const databaseUrl = process.env.DATABASE_URL;

export const createSequelizeInstance = (options?: Options) => {
  const withDefaults = mergeDeepRight({
    define: {
      freezeTableName: true,
    },
  });

  const sequelize = new Sequelize(databaseUrl, withDefaults(options ?? {}));

  // First initialize all models
  Object.keys(models).forEach((model) => {
    models[model].initialize?.(sequelize);
  });

  // Then apply associations
  Object.keys(models).forEach((model) => {
    models[model].associate?.(models);
    models[model].hooks?.(models);
  });

  return {
    sequelize,
    models,
  };
};
