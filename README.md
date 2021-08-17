# Prisma Sequelize Generator

A generator, which takes a Prisma 2 `schema.prisma` and generates Sequelize Models.

[![Generic badge](https://img.shields.io/badge/Generator%20for-◭%20Prisma-9F7AEA.svg)](https://www.prisma.io)
[![npm version](https://img.shields.io/npm/v/prisma-sequelize-generator?label=npm%20package)](https://www.npmjs.com/package/prisma-sequelize-generator)
[![npm downloads](https://img.shields.io/npm/dm/prisma-sequelize-generator)](https://www.npmjs.com/package/prisma-sequelize-generator)
[![build status](https://img.shields.io/github/workflow/status/floydspace/prisma-sequelize-generator/release)](https://github.com/floydspace/prisma-sequelize-generator/actions/workflows/release.yml)
[![Code QL](https://github.com/floydspace/prisma-sequelize-generator/workflows/CodeQL/badge.svg)](https://github.com/floydspace/prisma-sequelize-generator/actions/workflows/codeql-analysis.yml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/floydspace/prisma-sequelize-generator/blob/master/LICENSE)

## Getting Started

**1. Install**

npm:

```shell
npm install prisma-sequelize-generator --save-dev
```

yarn:

```shell
yarn add -D prisma-sequelize-generator
```

**2. Add the generator to the schema**

```prisma
generator client {
  provider = "prisma-sequelize-generator"
}
```

With a custom output path (default=./models)

```prisma
generator client {
  provider = "prisma-sequelize-generator"
  output = "custom-output-path"
}
```

**3. Run generation**

prisma:

```shell
prisma generate
```

## Supported Node Versions

|         Node Version | Support            |
| -------------------: | :----------------- |
| (Maintenance LTS) 12 | :heavy_check_mark: |
|      (Active LTS) 14 | :heavy_check_mark: |
|         (Current) 16 | :heavy_check_mark: |
