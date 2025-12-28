import type { ImportDeclaration, ImportSpecifier, Identifier } from "estree";
import type { PatternConfig } from "./types.ts";

/**
 * Converts a string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Converts a string to camelCase
 */
export function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Transforms an import name based on the specified transformation
 */
export function transformImportName(
  name: string,
  transform?: PatternConfig["transformImportName"],
): string {
  if (!transform) return name;

  if (typeof transform === "function") {
    return transform(name);
  }

  switch (transform) {
    case "lowercase":
      return name.toLowerCase();
    case "kebab-case":
      return toKebabCase(name);
    case "camelCase":
      return toCamelCase(name);
    default:
      return name;
  }
}

/**
 * Determines if an import should be treated as a named export based on its suffix
 */
export function getMatchingSuffix(
  importName: string,
  namedExports?: PatternConfig["namedExports"],
): string | undefined {
  if (!namedExports) return undefined;

  for (const suffix of namedExports.suffixes) {
    if (importName.endsWith(suffix)) {
      return suffix;
    }
  }

  return undefined;
}

/**
 * Generates the import path for a named export
 */
export function getNamedExportImportPath(
  importName: string,
  matchingSuffix: string,
  pattern: PatternConfig,
): string {
  const namedExports = pattern.namedExports!;

  // Get the base name (without suffix)
  let baseImportName;
  if (namedExports.transformImportName) {
    baseImportName = namedExports.transformImportName(
      importName,
      matchingSuffix,
    );
  } else {
    // Default behavior: remove the suffix and apply the standard transform
    const baseName = importName.slice(
      0,
      importName.length - matchingSuffix.length,
    );
    baseImportName = transformImportName(baseName, pattern.transformImportName);
  }

  // Use custom pattern if provided, otherwise use standard transform pattern
  return namedExports.customPattern
    ? namedExports.customPattern.replace("{{importName}}", baseImportName)
    : pattern.transformPattern.replace("{{importName}}", baseImportName);
}

/**
 * Generates the import path for a default export
 */
export function getDefaultExportImportPath(
  importName: string,
  pattern: PatternConfig,
): string {
  const transformedName = transformImportName(
    importName,
    pattern.transformImportName,
  );

  return pattern.transformPattern.replace("{{importName}}", transformedName);
}

/**
 * Generates the import statement for a specifier
 */
export function generateImportStatement(
  specifier: ImportSpecifier,
  node: ImportDeclaration,
  pattern: PatternConfig,
): string {
  const importName = (specifier.imported as Identifier).name;
  const localName = specifier.local.name;
  const isTypeImport =
    (node as ImportDeclaration & { importKind?: "type" }).importKind === "type";
  const typePrefix = isTypeImport ? "type " : "";

  const matchingSuffix = getMatchingSuffix(importName, pattern.namedExports);

  if (matchingSuffix) {
    const importPath = getNamedExportImportPath(
      importName,
      matchingSuffix,
      pattern,
    );
    return `import ${typePrefix}{ ${localName} } from "${importPath}";`;
  } else {
    const importPath = getDefaultExportImportPath(importName, pattern);
    return `import ${typePrefix}${localName} from "${importPath}";`;
  }
}
