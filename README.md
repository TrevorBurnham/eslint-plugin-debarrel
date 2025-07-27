# eslint-plugin-debarrel

An ESLint plugin to transform barrel imports into direct imports. For example:

```typescript
import { Button, DatePicker } from "@cloudscape-design/components";
```

Will be transformed to:

```typescript
import Button from "@cloudscape-design/components/button";
import DatePicker from "@cloudscape-design/components/date-picker";
```

## Why?

Importing from barrel files (files that re-export multiple modules from a single entry point) negatively impacts build performance.

See:

- [The Barrel File Debacle](https://marvinh.dev/blog/speeding-up-javascript-ecosystem-part-7/) by Marvin Hagemeister
- [My Journey to 3x Faster Builds](https://blog.vramana.com/posts/barrel_files_slow_build/) by Ramana Venkata
- [The Vite performance guide](https://vite.dev/guide/performance#avoid-barrel-files)

## Installation

```bash
npm install --save-dev eslint-plugin-debarrel
```

## Usage

### Flat config

In your `eslint.config.mjs`:

```mjs
import eslintPluginDebarrel from "eslint-plugin-debarrel";

export default [
  // other config...
  {
    plugins: {
      debarrel: eslintPluginDebarrel,
    },
    rules: {
      "debarrel/debarrel": [
        "error",
        {
          patterns: [
            {
              barrel: "@cloudscape-design/components",
              transformPattern: "@cloudscape-design/components/{{importName}}",
              transformImportName: "kebab-case",
              namedExports: {
                suffixes: ["Props"],
              },
            },
          ],
        },
      ],
    },
  },
];
```

### Legacy config

Add `debarrel` to the plugins section of your `.eslintrc` configuration file:

```json
{
  "plugins": ["debarrel"]
}
```

Then configure the rule under the rules section:

```json
{
  "rules": {
    "debarrel/debarrel": [
      "error",
      {
        "patterns": [
          {
            "barrel": "@cloudscape-design/components",
            "transformPattern": "@cloudscape-design/components/{{importName}}",
            "transformImportName": "lowercase",
            "namedExports": {
              "suffixes": ["Props"]
            }
          }
        ]
      }
    ]
  }
}
```

## Rule configuration

For each barrel file you want to avoid, add an object to the `patterns` list with:

- `barrel`: The import path of the barrel file
- `transformPattern`: The path that each named import should be imported from as a default import instead, using `{{importName}}` as a placeholder
- `transformImportName` (optional): Transform the original import name before using it in the `transformPattern`. The transform can be either a string-to-string function or one of the following: `"lowercase" | "kebab-case" | "camelCase"`.
- `namedExports` (optional): Configuration for handling imports that should be treated as named exports rather than default exports.
  - `suffixes`: Array of suffixes (e.g., `["Props", "Interface"]`) that should be treated as named exports
  - `customPattern` (optional): Custom pattern for named exports, defaults to the same as `transformPattern`
  - `transformImportName` (optional): Custom function to transform the import name for named exports
