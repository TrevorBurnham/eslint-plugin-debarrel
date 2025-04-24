/**
 * Configuration for handling named exports
 */
export interface NamedExportsConfig {
  /** Array of suffixes that should be treated as named exports */
  suffixes: string[];
  /** Optional custom pattern for named exports */
  customPattern?: string;
  /** Optional function to transform the import name for named exports */
  transformImportName?: (importName: string, suffix: string) => string;
}

/**
 * Configuration for a barrel import pattern
 */
export interface PatternConfig {
  /** The import path of the barrel file */
  barrel: string;
  /** The path pattern for direct imports */
  transformPattern: string;
  /** Optional transformation for import names */
  transformImportName?:
    | "lowercase"
    | "kebab-case"
    | "camelCase"
    | ((importName: string) => string);
  /** Optional configuration for handling named exports */
  namedExports?: NamedExportsConfig;
}

/**
 * Rule options
 */
export interface RuleOptions {
  /** Array of barrel import patterns to transform */
  patterns: PatternConfig[];
}
