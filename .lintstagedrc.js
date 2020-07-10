#!/usr/bin/env node

module.exports = {
  'src/main/**/*.ts': (files) => [
    `./node_modules/.bin/tslint --fix -p ./tsconfig.json ${files
      .map((file) => file.replace(process.cwd() + '/', ''))
      .join(' ')}`,
    `./node_modules/.bin/prettier --write ${files.map((file) => file.replace(process.cwd() + '/', '')).join(' ')}`,
  ],
  'src/renderer/**/*.ts': (files) => [
    `./node_modules/.bin/tslint --fix -p ./src/renderer/tsconfig.json ${files
      .map((file) => file.replace(process.cwd() + '/', ''))
      .join(' ')}`,
    `./node_modules/.bin/ng lint --fix  ${files
      .map((file) => '--files ' + file.replace(process.cwd() + '/', ''))
      .join(' ')}`,
    `./node_modules/.bin/prettier --write ${files.map((file) => file.replace(process.cwd() + '/', '')).join(' ')}`,
  ],
  'src/**/*.html': (files) => [
    `./node_modules/.bin/prettier --write ${files.map((file) => file.replace(process.cwd() + '/', '')).join(' ')}`,
  ],
  'src/**/*.less': ['npm run lint:style', './node_modules/.bin/prettier --write'],
};
