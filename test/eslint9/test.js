import { ESLint } from "eslint9";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const TEST_FILE = path.join(__dirname, "fixtures/src/test.ts");
const EXPECTED_OUTPUT = `import ComponentA from "@test/barrel/ComponentA";
import ComponentB from "@test/barrel/ComponentB";

console.log(ComponentA(), ComponentB());`;

function normalizeOutput(output) {
  return output.replace(/\r\n/g, "\n").trim();
}

async function runTest() {
  try {
    console.log("Loading ESLint plugin...");
    const plugin = await import("../../dist/index.js");
    console.log("Plugin exports:", plugin);
    console.log("Plugin loaded successfully");

    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
          parser: (await import("@typescript-eslint/parser")).default,
          parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
          },
        },
        plugins: {
          debarrel: plugin.default,
        },
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
      },
      fix: true,
    });

    console.log("Running ESLint on test file...");
    const results = await eslint.lintFiles([TEST_FILE]);

    if (results.length === 0) {
      throw new Error("No results returned from ESLint");
    }

    const result = results[0];
    console.log("ESLint Results:", JSON.stringify(result, null, 2));

    if (!result.output) {
      throw new Error("No transformation was applied to the test file");
    }

    const normalizedOutput = normalizeOutput(result.output);
    const normalizedExpected = normalizeOutput(EXPECTED_OUTPUT);

    if (normalizedOutput !== normalizedExpected) {
      console.error("Unexpected transformation output");
      console.error("Expected:", normalizedExpected);
      console.error("Got:", normalizedOutput);
      throw new Error("Transformation output did not match expected output");
    }

    console.log("✅ ESLint 9 test passed.");
  } catch (error) {
    console.error("Test failed:", error.message);
    process.exit(1);
  }
}

runTest();
