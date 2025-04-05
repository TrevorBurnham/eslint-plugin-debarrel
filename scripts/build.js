import { readdir, rm, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cjsDir = join(__dirname, "../dist/cjs-temp");
const distDir = join(__dirname, "../dist");

async function getJsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const res = join(dir, entry.name);
      return entry.isDirectory() ? getJsFiles(res) : res;
    }),
  );
  return files.flat().filter((file) => file.endsWith(".js"));
}

async function renameCjsFiles() {
  try {
    console.log("Renaming CJS files...");
    const jsFiles = await getJsFiles(cjsDir);

    await Promise.all(
      jsFiles.map(async (file) => {
        const relativePath = file.split("cjs-temp/")[1];
        const destPath = join(distDir, relativePath.replace(".js", ".cjs"));

        let content = await readFile(file, "utf8");
        content = content
          .replace(/from ['"](.*?)\.js['"]/g, 'from "$1.cjs"')
          .replace(/require\(['"](.*?)\.js['"]\)/g, 'require("$1.cjs")');

        await writeFile(destPath, content);
        await rm(file);
      }),
    );

    await rm(cjsDir, { recursive: true });
    console.log("CJS files renamed successfully");
  } catch (error) {
    console.error("Error renaming CJS files:", error);
    process.exit(1);
  }
}

async function runTypeScriptBuilds() {
  try {
    console.log("Running TypeScript builds...");
    execSync("tsc -p tsconfig.json", { stdio: "inherit" });
    execSync("tsc -p tsconfig.cjs.json", { stdio: "inherit" });
    console.log("TypeScript builds completed successfully");
  } catch (error) {
    console.error("Error running TypeScript builds:", error);
    process.exit(1);
  }
}

async function main() {
  try {
    await runTypeScriptBuilds();
    await renameCjsFiles();
    console.log("Build completed successfully");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

main();
