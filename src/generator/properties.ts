export const PrismaTypeToSequelizeType: Record<string, string> = {
  Int: 'INTEGER',
  Float: 'FLOAT',
  Decimal: 'DECIMAL',
  String: 'STRING',
  Boolean: 'BOOLEAN',
  DateTime: 'DATE',
  Json: 'JSONB',
  BigInt: 'BIGINT',
};

export interface ModelProperties {
  modelName: string;
  dbName: string;
  scalarFields: ScalarProperties[];
  belongsToFields: RelationProperties[];
  hasOneFields: RelationProperties[];
  hasManyFields: RelationProperties[];
  hasCreatedAt: boolean;
  hasUpdatedAt: boolean;
  hasDeletedAt: boolean;
}

export interface RelationProperties {
  as: string;
  name: string;
  targetKey: string;
  foreignKey: string;
  sourceKey: string;
  relationName: string;
}

export interface ScalarProperties {
  isList: boolean;
  hasDefaultValue: boolean;
  default: any;
  isId: boolean;
  isUnique: boolean;
  fieldName: string;
  type: string;
  allowNull: boolean;
  isAutoincrement: boolean;
  isUuid: boolean;
  isNow: boolean;
}
