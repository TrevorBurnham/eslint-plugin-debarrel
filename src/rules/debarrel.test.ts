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

  it("transforms import names to kebab-case", () => {
    ruleTester.run("debarrel", rule, {
      valid: [],
      invalid: [
        {
          code: 'import { DatePicker } from "@cloudscape-design/components";',
          options: [
            {
              patterns: [
                {
                  barrel: "@cloudscape-design/components",
                  transformPattern:
                    "@cloudscape-design/components/{{importName}}",
                  transformImportName: "kebab-case",
                },
              ],
            },
          ],
          errors: [
            {
              message:
                "Barrel imports should be transformed into direct imports",
            },
          ],
          output:
            'import DatePicker from "@cloudscape-design/components/date-picker";',
        },
      ],
    });
  });

  it("transforms import names to lowercase", () => {
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
                  transformImportName: "lowercase",
                },
              ],
            },
          ],
          errors: [
            {
              message:
                "Barrel imports should be transformed into direct imports",
            },
          ],
          output: 'import MyComponent from "@my-lib/components/mycomponent";',
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
                  transformImportName: "camelCase",
                },
              ],
            },
          ],
          errors: [
            {
              message:
                "Barrel imports should be transformed into direct imports",
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
                  transformImportName: (name) => `custom-${name.toLowerCase()}`,
                },
              ],
            },
          ],
          errors: [
            {
              message:
                "Barrel imports should be transformed into direct imports",
            },
          ],
          output:
            'import MyComponent from "@my-lib/components/custom-mycomponent";',
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
                  transformImportName: (name) =>
                    name.replace("Button", "btn-").toLowerCase(),
                },
              ],
            },
          ],
          errors: [
            {
              message:
                "Barrel imports should be transformed into direct imports",
            },
          ],
          output: `import ButtonA from "@my-lib/components/btn-a";
import ButtonB from "@my-lib/components/btn-b";`,
        },
      ],
    });
  });

  it("transforms imports with Props suffix to named imports", () => {
    ruleTester.run("debarrel", rule, {
      valid: [],
      invalid: [
        {
          code: 'import { Button, ButtonProps } from "@cloudscape-design/components";',
          options: [
            {
              patterns: [
                {
                  barrel: "@cloudscape-design/components",
                  transformPattern:
                    "@cloudscape-design/components/{{importName}}",
                  transformImportName: "kebab-case",
                  namedExports: {
                    suffixes: ["Props"],
                  },
                },
              ],
            },
          ],
          errors: [
            {
              message:
                "Barrel imports should be transformed into direct imports",
            },
          ],
          output: `import Button from "@cloudscape-design/components/button";
import { ButtonProps } from "@cloudscape-design/components/button";`,
        },
      ],
    });
  });

  it("transforms imports with multiple suffixes to named imports", () => {
    ruleTester.run("debarrel", rule, {
      valid: [],
      invalid: [
        {
          code: 'import { Button, ButtonProps, ButtonInterface } from "@my-lib/components";',
          options: [
            {
              patterns: [
                {
                  barrel: "@my-lib/components",
                  transformPattern: "@my-lib/components/{{importName}}",
                  transformImportName: "kebab-case",
                  namedExports: {
                    suffixes: ["Props", "Interface"],
                  },
                },
              ],
            },
          ],
          errors: [
            {
              message:
                "Barrel imports should be transformed into direct imports",
            },
          ],
          output: `import Button from "@my-lib/components/button";
import { ButtonProps } from "@my-lib/components/button";
import { ButtonInterface } from "@my-lib/components/button";`,
        },
      ],
    });
  });

  it("preserves type imports for regular imports", () => {
    ruleTester.run("debarrel", rule, {
      valid: [],
      invalid: [
        {
          code: 'import type { Button } from "@my-lib/components";',
          options: [
            {
              patterns: [
                {
                  barrel: "@my-lib/components",
                  transformPattern: "@my-lib/components/{{importName}}",
                  transformImportName: "kebab-case",
                },
              ],
            },
          ],
          errors: [
            {
              message:
                "Barrel imports should be transformed into direct imports",
            },
          ],
          output: 'import type Button from "@my-lib/components/button";',
        },
      ],
    });
  });

  it("preserves type imports for named exports", () => {
    ruleTester.run("debarrel", rule, {
      valid: [],
      invalid: [
        {
          code: 'import type { ButtonProps } from "@my-lib/components";',
          options: [
            {
              patterns: [
                {
                  barrel: "@my-lib/components",
                  transformPattern: "@my-lib/components/{{importName}}",
                  transformImportName: "kebab-case",
                  namedExports: {
                    suffixes: ["Props"],
                  },
                },
              ],
            },
          ],
          errors: [
            {
              message:
                "Barrel imports should be transformed into direct imports",
            },
          ],
          output:
            'import type { ButtonProps } from "@my-lib/components/button";',
        },
      ],
    });
  });

  it("uses custom pattern for named exports if provided", () => {
    ruleTester.run("debarrel", rule, {
      valid: [],
      invalid: [
        {
          code: 'import { ButtonProps } from "@my-lib/components";',
          options: [
            {
              patterns: [
                {
                  barrel: "@my-lib/components",
                  transformPattern: "@my-lib/components/{{importName}}",
                  transformImportName: "kebab-case",
                  namedExports: {
                    suffixes: ["Props"],
                    customPattern: "@my-lib/components/types/{{importName}}",
                  },
                },
              ],
            },
          ],
          errors: [
            {
              message:
                "Barrel imports should be transformed into direct imports",
            },
          ],
          output:
            'import { ButtonProps } from "@my-lib/components/types/button";',
        },
      ],
    });
  });

  it("uses custom transform function for named exports if provided", () => {
    ruleTester.run("debarrel", rule, {
      valid: [],
      invalid: [
        {
          code: 'import { ButtonProps } from "@my-lib/components";',
          options: [
            {
              patterns: [
                {
                  barrel: "@my-lib/components",
                  transformPattern: "@my-lib/components/{{importName}}",
                  transformImportName: "kebab-case",
                  namedExports: {
                    suffixes: ["Props"],
                    transformImportName: () => {
                      // Return a lowercase result for the test to pass
                      return "button-custom";
                    },
                  },
                },
              ],
            },
          ],
          errors: [
            {
              message:
                "Barrel imports should be transformed into direct imports",
            },
          ],
          output:
            'import { ButtonProps } from "@my-lib/components/button-custom";',
        },
      ],
    });
  });

  it("handles mixed regular and named export imports", () => {
    ruleTester.run("debarrel", rule, {
      valid: [],
      invalid: [
        {
          code: 'import { Button, Card, ButtonProps, CardInterface } from "@my-lib/components";',
          options: [
            {
              patterns: [
                {
                  barrel: "@my-lib/components",
                  transformPattern: "@my-lib/components/{{importName}}",
                  transformImportName: "kebab-case",
                  namedExports: {
                    suffixes: ["Props", "Interface"],
                  },
                },
              ],
            },
          ],
          errors: [
            {
              message:
                "Barrel imports should be transformed into direct imports",
            },
          ],
          output: `import Button from "@my-lib/components/button";
import Card from "@my-lib/components/card";
import { ButtonProps } from "@my-lib/components/button";
import { CardInterface } from "@my-lib/components/card";`,
        },
      ],
    });
  });
});
