import { readdir, rename, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cjsDir = join(__dirname, '../dist/cjs-temp');
const distDir = join(__dirname, '../dist');

async function renameCjsFiles() {
  // Recursively get all .js files
  async function getJsFiles(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(entries.map((entry) => {
      const res = join(dir, entry.name);
      return entry.isDirectory() ? getJsFiles(res) : res;
    }));
    return files.flat().filter(file => file.endsWith('.js'));
  }

  // Rename all .js files to .cjs and move them to dist
  const jsFiles = await getJsFiles(cjsDir);
  await Promise.all(jsFiles.map(async (file) => {
    const relativePath = file.split('cjs-temp/')[1];
    const destPath = join(distDir, relativePath.replace('.js', '.cjs'));
    await rename(file, destPath);
  }));

  // Clean up temporary directory
  await rm(cjsDir, { recursive: true });
}

// Run TypeScript builds
const { execSync } = await import('node:child_process');
execSync('tsc -p tsconfig.json', { stdio: 'inherit' });
execSync('tsc -p tsconfig.cjs.json', { stdio: 'inherit' });

// Rename CJS files
await renameCjsFiles();
