const path = require("path");

const config = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["debarrel"],
  rules: {
    "debarrel/debarrel": [
      "error",
      {
        patterns: [
          {
            barrel: "@test/barrel",
            transformPattern: "@test/barrel/{{importName}}",
          },
        ],
      },
    ],
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
  env: {
    node: true,
    es2020: true,
  },
};

module.exports = config;
