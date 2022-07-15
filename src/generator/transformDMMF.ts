import { morphism, Schema, createSchema } from 'morphism';
import R from 'ramda';

import { included, isNotEmpty, notIncluded } from './helpers';
import { ModelProperties, PrismaTypeToSequelizeType, RelationProperties, ScalarProperties } from './properties';

import type { DMMF } from '@prisma/generator-helper';

export function transformDMMF(dmmf: DMMF.Document) {
  const enumIndex = R.indexBy(R.prop('name'), dmmf.datamodel.enums ?? []);
  const enumValuesToString = (e: DMMF.DatamodelEnum) =>
    `ENUM(${e.values
      .map(R.prop('name'))
      .map((n) => `'${n}'`)
      .join(', ')})`;

  const scalarSchema = createSchema<ScalarProperties, DMMF.Field>(
    {
      isList: 'isList',
      hasDefaultValue: R.allPass([
        R.prop('hasDefaultValue'),
        R.compose(R.not, R.pathEq(['default', 'name'], 'dbgenerated')),
      ]),
      default: 'default',
      isId: 'isId',
      isUnique: 'isUnique',
      fieldName: 'name',
      type: (field: DMMF.Field) =>
        field.kind === 'scalar'
          ? R.prop(field.type, PrismaTypeToSequelizeType)
          : enumValuesToString(R.prop(field.type, enumIndex)),
      allowNull: R.anyPass([
        R.compose(R.not, R.prop('isRequired')),
        R.compose(R.pathEq(['default', 'name'], 'dbgenerated')),
      ]),
      isAutoincrement: R.allPass([R.prop('hasDefaultValue'), R.pathEq(['default', 'name'], 'autoincrement')]),
      isUuid: R.allPass([R.prop('hasDefaultValue'), R.pathEq(['default', 'name'], 'uuid')]),
      isNow: R.allPass([R.prop('hasDefaultValue'), R.pathEq(['default', 'name'], 'now')]),
    },
    { undefinedValues: { strip: true } }
  );

  const relationMorphism = morphism<Schema<RelationProperties, DMMF.Field>>({
    as: 'name',
    name: 'type',
    targetKey: 'relationToFields[0]',
    foreignKey: 'relationFromFields[0]',
    relationName: 'relationName',
  });

  const modelMorphism = morphism<Schema<ModelProperties, DMMF.Model>>({
    modelName: 'name',
    dbName: 'dbName',
    scalarFields: {
      path: 'fields',
      fn: (fields: DMMF.Field[]) =>
        R.filter(
          R.allPass([
            R.propSatisfies(included(['scalar', 'enum']), 'kind'),
            R.propSatisfies(notIncluded(['createdAt', 'updatedAt', 'deletedAt']), 'name'),
          ]),
          fields
        ).map(morphism(scalarSchema)),
    },
    belongsToFields: {
      path: 'fields',
      fn: (fields: DMMF.Field[]) =>
        R.filter(
          R.allPass([
            R.propEq('kind', 'object'),
            R.propSatisfies(R.not, 'isList'),
            R.propSatisfies(isNotEmpty, 'relationToFields'),
          ]),
          fields
        ).map(relationMorphism),
    },
    hasOneFields: {
      path: 'fields',
      fn: (fields: DMMF.Field[]) =>
        R.filter(
          R.allPass([
            R.propEq('kind', 'object'),
            R.propSatisfies(R.not, 'isList'),
            R.propSatisfies(R.isEmpty, 'relationToFields'),
          ]),
          fields
        ).map(relationMorphism),
    },
    hasManyFields: {
      path: 'fields',
      fn: (fields: DMMF.Field[]) =>
        R.filter(R.allPass([R.propEq('kind', 'object'), R.prop('isList')]), fields).map(relationMorphism),
    },
    hasCreatedAt: { path: 'fields', fn: R.compose(R.includes('createdAt'), R.map(R.prop('name'))) },
    hasUpdatedAt: { path: 'fields', fn: R.compose(R.includes('updatedAt'), R.map(R.prop('name'))) },
    hasDeletedAt: { path: 'fields', fn: R.compose(R.includes('deletedAt'), R.map(R.prop('name'))) },
  });

  const transformMorphism = morphism<Schema<{ models: ModelProperties[] }, DMMF.Datamodel>>({
    models: { path: 'models', fn: modelMorphism },
  });
  const transformed = transformMorphism(dmmf.datamodel);
  const hasManyRelationsToRemove = [];
  let modelIndex = 0;
  for (const model of transformed.models) {
    let index = 0;
    for (const hasManyField of model.hasManyFields) {
      const { relationName } = hasManyField;
      // Look for many-to-many relations
      const relations = transformed.models.reduce((found: RelationProperties[], model) => {
        const match = model.hasManyFields.find((hasManyField) => hasManyField.relationName === relationName);
        if (match) {
          return [...found, match];
        }
        return found;
      }, []);
      // Many-to-many relation
      if (relations && relations.length === 2) {
        const joinTableName = `_${relationName}`;
        model.belongsToManyFields = [
          ...(model.belongsToManyFields || []),
          {
            ...hasManyField,
            through: joinTableName,
            foreignKey:
              hasManyField.foreignKey || relationName.split('To').findIndex((n) => n === model.modelName) === 0
                ? 'A'
                : 'B',
          },
        ];
        hasManyRelationsToRemove.push([modelIndex, index]);
        if (!transformed.models.find((m) => m.modelName === joinTableName)) {
          transformed.models.push({
            modelName: joinTableName,
            dbName: joinTableName,
            scalarFields: [],
            belongsToFields: [],
            hasOneFields: [],
            hasManyFields: [],
            belongsToManyFields: [],
            hasCreatedAt: false,
            hasUpdatedAt: false,
            hasDeletedAt: false,
          });
        }
      } else {
        // Link invertible hasMany/belongsTo relations
        const inversedRelation = transformed.models.reduce((found: RelationProperties | null, model) => {
          const match = model.belongsToFields.find((belongsToField) => belongsToField.relationName === relationName);
          if (match) {
            return match;
          }
          return found;
        }, null);
        if (inversedRelation) {
          hasManyField.foreignKey = inversedRelation.foreignKey;
          hasManyField.sourceKey = inversedRelation.targetKey;
        }
      }
      index++;
    }
    for (const hasOneField of model.hasOneFields) {
      hasOneField.foreignKey = model.scalarFields.find((f) => f.isId)?.fieldName || '';
    }
    modelIndex++;
  }
  for (const relationToRemove of hasManyRelationsToRemove) {
    transformed.models[relationToRemove[0]].hasManyFields.splice(relationToRemove[1], 1);
  }
  return transformed;
}
