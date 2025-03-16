# eslint-plugin-debarrel

An ESLint plugin to transform barrel imports into direct imports. For example:

```typescript
import { Button, Dialog } from "@material-ui/core";
```

Will be transformed to:

```typescript
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
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
              barrel: "@material-ui/core",
              transformPattern: "@material-ui/core/{{importName}}",
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
            "barrel": "@material-ui/core",
            "transformPattern": "@material-ui/core/{{importName}}"
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
