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
});
