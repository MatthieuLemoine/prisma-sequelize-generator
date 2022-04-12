import { Options, Sequelize } from 'sequelize';
import { mergeDeepRight } from 'ramda';
import { getDatabaseUrl } from '@daas/common';

import * as models from './models';

export const createSequelizeInstance = async (options?: Options) => {
  const withDefaults = mergeDeepRight({
    define: {
      freezeTableName: true,
    },
  });

  const databaseUrl = await getDatabaseUrl();
  const sequelize = new Sequelize(databaseUrl.split('?')[0], withDefaults(options ?? {}));

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
