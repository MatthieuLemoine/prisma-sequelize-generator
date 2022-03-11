const path = require('path');
const fs = require('fs/promises');
const { constants } = require('fs');
const prettier = require('prettier');

module.exports = function (plop) {
  plop.setActionType('prettier-add', prettierAdd);
  plop.setHelper('eq', (v1, v2) => v1 === v2);
  plop.setHelper('ne', (v1, v2) => v1 !== v2);
  plop.setHelper('lt', (v1, v2) => v1 < v2);
  plop.setHelper('gt', (v1, v2) => v1 > v2);
  plop.setHelper('lte', (v1, v2) => v1 <= v2);
  plop.setHelper('gte', (v1, v2) => v1 >= v2);
  plop.setHelper('and', function () {
    return Array.prototype.every.call(arguments, Boolean);
  });
  plop.setHelper('or', function () {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
  });

  plop.setGenerator('utils', {
    actions: () => [
      {
        type: 'prettier-add',
        path: 'utils/find.{{outputFormat}}',
        templateFile: path.join(__dirname, './{{outputFormat}}/utils/find.hbs'),
      },
      {
        type: 'prettier-add',
        path: 'utils/index.{{outputFormat}}',
        templateFile: path.join(__dirname, './{{outputFormat}}/utils/index.hbs'),
      },
    ],
  });

  plop.setGenerator('index', {
    actions: () => [
      {
        type: 'prettier-add',
        path: 'models/index.{{outputFormat}}',
        templateFile: path.join(__dirname, './{{outputFormat}}/models/index.hbs'),
      },
      {
        type: 'prettier-add',
        path: 'index.{{outputFormat}}',
        templateFile: path.join(__dirname, './{{outputFormat}}/index.hbs'),
      },
    ],
  });

  plop.setGenerator('Model', {
    actions: () => [
      {
        type: 'prettier-add',
        path: 'models/{{modelName}}.{{outputFormat}}',
        templateFile: path.join(__dirname, './{{outputFormat}}/models/Model.hbs'),
      },
    ],
  });
};

async function prettierAdd(data, cfg, plop) {
  const fileDestPath = makeDestPath(data, cfg, plop);
  const { force, skipIfExists = false } = cfg;
  cfg.templateFile = getRenderedTemplatePath(data, cfg, plop);
  try {
    // check path
    let destExists = await fs
      .access(fileDestPath)
      .then(() => true)
      .catch(() => false);
    // if we are forcing and the file already exists, delete the file
    if (force === true && destExists) {
      await fs.unlink(fileDestPath);
      destExists = false;
    }

    // we can't create files where one already exists
    if (destExists) {
      if (skipIfExists) {
        return `[SKIPPED] ${fileDestPath} (exists)`;
      }
      throw `File already exists\n -> ${fileDestPath}`;
    } else {
      await fs.mkdir(path.dirname(fileDestPath), { recursive: true });

      const absTemplatePath = (cfg.templateFile && path.resolve(plop.getPlopfilePath(), cfg.templateFile)) || null;
      const renderedTemplate = await getRenderedTemplate(data, cfg, plop);
      const transformedTemplate = await getTransformedTemplate(renderedTemplate, data, cfg);

      await fs.writeFile(
        fileDestPath,
        prettier.format(transformedTemplate, {
          singleQuote: true,
          trailingComma: 'all',
        })
      );

      // keep the executable flags
      if (absTemplatePath != null) {
        const sourceStats = await fs.stat(absTemplatePath);
        const destStats = await fs.stat(fileDestPath);
        const executableFlags = sourceStats.mode & (constants.S_IXUSR | constants.S_IXGRP | constants.S_IXOTH);
        await fs.chmod(fileDestPath, destStats.mode | executableFlags);
      }
    }
    // return the added file path (relative to the destination path)
    return getRelativeToBasePath(fileDestPath, plop);
  } catch (err) {
    console.error(err);
    throwStringifiedError(err);
  }
}

function getFullData(data, cfg) {
  return Object.assign({}, cfg.data, data);
}

function normalizePath(path) {
  return !path.sep || path.sep === '\\' ? path.replace(/\\/g, '/') : path;
}

function makeDestPath(data, cfg, plop) {
  return path.resolve(plop.getDestBasePath(), plop.renderString(normalizePath(cfg.path) || '', getFullData(data, cfg)));
}

async function getTemplate(data, cfg, plop) {
  const makeTmplPath = (p) => path.resolve(plop.getPlopfilePath(), p);

  let { template } = cfg;

  if (cfg.templateFile) {
    template = await fs.readFile(makeTmplPath(cfg.templateFile), { encoding: 'utf8' });
  }
  if (template == null) {
    template = '';
  }

  return template;
}

async function getRenderedTemplate(data, cfg, plop) {
  const template = await getTemplate(data, cfg, plop);

  return plop.renderString(template, getFullData(data, cfg));
}

async function getTransformedTemplate(template, data, cfg) {
  // transform() was already typechecked at runtime in interface check
  if ('transform' in cfg) {
    const result = await cfg.transform(template, data);

    if (typeof result !== 'string')
      throw new TypeError(`Invalid return value for transform (${JSON.stringify(result)} is not a string)`);

    return result;
  } else {
    return template;
  }
}

function getRelativeToBasePath(filePath, plop) {
  return filePath.replace(path.resolve(plop.getDestBasePath()), '');
}

function throwStringifiedError(err) {
  console.error(err);
  if (typeof err === 'string') {
    throw err;
  } else {
    throw err.message || JSON.stringify(err);
  }
}

function getRenderedTemplatePath(data, cfg, plop) {
  if (cfg.templateFile) {
    const absTemplatePath = path.resolve(plop.getPlopfilePath(), cfg.templateFile);
    return plop.renderString(normalizePath(absTemplatePath), getFullData(data, cfg));
  }
  return null;
}
