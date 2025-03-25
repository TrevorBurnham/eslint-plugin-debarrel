import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import rule from "./debarrel.js";

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

describe("debarrel", () => {
  const options = [
    {
      patterns: [
        {
          barrel: "@material-ui/core",
          transformPattern: "@material-ui/core/{{importName}}",
        },
      ],
    },
  ];

  it("allows direct imports", () => {
    ruleTester.run("debarrel", rule, {
      valid: [
        {
          code: 'import Button from "@material-ui/core/Button";',
          options,
        },
      ],
      invalid: [],
    });
  });

  it("transforms multiple imports from a barrel", () => {
    ruleTester.run("debarrel", rule, {
      valid: [],
      invalid: [
        {
          code: 'import { Button, Dialog } from "@material-ui/core";',
          options,
          errors: [
            {
              message:
                "Barrel imports should be transformed into direct imports",
            },
          ],
          output: `import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";`,
        },
      ],
    });
  });

  it("transforms aliased imports from a barrel", () => {
    ruleTester.run("debarrel", rule, {
      valid: [],
      invalid: [
        {
          code: 'import { Button as MuiButton } from "@material-ui/core";',
          options,
          errors: [
            {
              message:
                "Barrel imports should be transformed into direct imports",
            },
          ],
          output: `import MuiButton from "@material-ui/core/Button";`,
        },
      ],
    });
  });

  it("transforms import names to lowercase", () => {
    ruleTester.run("debarrel", rule, {
      valid: [],
      invalid: [
        {
          code: 'import { Box } from "@cloudscape-design/components";',
          options: [
            {
              patterns: [
                {
                  barrel: "@cloudscape-design/components",
                  transformPattern: "@cloudscape-design/components/{{importName}}",
                  transformImportName: "lowercase"
                },
              ],
            },
          ],
          errors: [
            {
              message: "Barrel imports should be transformed into direct imports",
            },
          ],
          output: 'import Box from "@cloudscape-design/components/box";',
        },
      ],
    });
  });

  it("transforms import names to kebab-case", () => {
    ruleTester.run("debarrel", rule, {
      valid: [],
      invalid: [
        {
          code: 'import { MyComponent } from "@my-lib/components";',
          options: [
            {
              patterns: [
                {
                  barrel: "@my-lib/components",
                  transformPattern: "@my-lib/components/{{importName}}",
                  transformImportName: "kebab-case"
                },
              ],
            },
          ],
          errors: [
            {
              message: "Barrel imports should be transformed into direct imports",
            },
          ],
          output: 'import MyComponent from "@my-lib/components/my-component";',
        },
      ],
    });
  });

  it("transforms import names to camelCase", () => {
    ruleTester.run("debarrel", rule, {
      valid: [],
      invalid: [
        {
          code: 'import { MyComponent } from "@my-lib/components";',
          options: [
            {
              patterns: [
                {
                  barrel: "@my-lib/components",
                  transformPattern: "@my-lib/components/{{importName}}",
                  transformImportName: "camelCase"
                },
              ],
            },
          ],
          errors: [
            {
              message: "Barrel imports should be transformed into direct imports",
            },
          ],
          output: 'import MyComponent from "@my-lib/components/myComponent";',
        },
      ],
    });
  });

  it("transforms import names using a custom function", () => {
    ruleTester.run("debarrel", rule, {
      valid: [],
      invalid: [
        {
          code: 'import { MyComponent } from "@my-lib/components";',
          options: [
            {
              patterns: [
                {
                  barrel: "@my-lib/components",
                  transformPattern: "@my-lib/components/{{importName}}",
                  transformImportName: (name) => `custom-${name.toLowerCase()}`
                },
              ],
            },
          ],
          errors: [
            {
              message: "Barrel imports should be transformed into direct imports",
            },
          ],
          output: 'import MyComponent from "@my-lib/components/custom-mycomponent";',
        },
      ],
    });
  });

  it("handles multiple imports with custom function transformer", () => {
    ruleTester.run("debarrel", rule, {
      valid: [],
      invalid: [
        {
          code: 'import { ButtonA, ButtonB } from "@my-lib/components";',
          options: [
            {
              patterns: [
                {
                  barrel: "@my-lib/components",
                  transformPattern: "@my-lib/components/{{importName}}",
                  transformImportName: (name) => name.replace("Button", "btn-").toLowerCase()
                },
              ],
            },
          ],
          errors: [
            {
              message: "Barrel imports should be transformed into direct imports",
            },
          ],
          output: `import ButtonA from "@my-lib/components/btn-a";
import ButtonB from "@my-lib/components/btn-b";`,
        },
      ],
    });
  });
});
