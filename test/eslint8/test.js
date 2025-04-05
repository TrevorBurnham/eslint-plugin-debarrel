import { createRequire } from "module";
import { ESLint } from "eslint";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

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
    const plugin = require("../../dist/index.cjs");
    console.log("Plugin loaded successfully");

    const eslint = new ESLint({
      overrideConfigFile: path.join(__dirname, ".eslintrc.cjs"),
      useEslintrc: false,
      fix: true,
      plugins: {
        debarrel: plugin.default,
      },
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

    console.log(
      "Test passed! The plugin successfully transformed the barrel imports.",
    );
  } catch (error) {
    console.error("Test failed:", error.message);
    process.exit(1);
  }
}

runTest();
