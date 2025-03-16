import type { Rule } from "eslint";
import type { ImportDeclaration, ImportSpecifier, Identifier } from "estree";

interface PatternConfig {
  barrel: string;
  transformPattern: string;
}

interface RuleOptions {
  patterns: PatternConfig[];
}

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Transform barrel imports into direct imports",
      recommended: false,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          patterns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                barrel: { type: "string" },
                transformPattern: { type: "string" },
              },
              required: ["barrel", "transformPattern"],
              additionalProperties: false,
            },
          },
        },
        required: ["patterns"],
        additionalProperties: false,
      },
    ],
  },

  create(context: Rule.RuleContext) {
    const options = context.options[0] as RuleOptions;
    const { patterns } = options;

    return {
      ImportDeclaration(node: ImportDeclaration) {
        const sourceValue = node.source.value;
        if (typeof sourceValue !== "string") return;

        const matchingPattern = patterns.find(
          (pattern) => pattern.barrel === sourceValue,
        );
        if (!matchingPattern) return;

        const specifiers = node.specifiers.filter(
          (specifier): specifier is ImportSpecifier =>
            specifier.type === "ImportSpecifier",
        );

        if (specifiers.length === 0) return;

        context.report({
          node,
          message: "Barrel imports should be transformed into direct imports",
          fix(fixer: Rule.RuleFixer) {
            const newImports = specifiers.map((specifier) => {
              const importName = (specifier.imported as Identifier).name;
              const localName = specifier.local.name;
              const newPath = matchingPattern.transformPattern.replace(
                "{{importName}}",
                importName,
              );
              return `import ${localName} from "${newPath}";`;
            });

            return fixer.replaceText(node, newImports.join("\n"));
          },
        });
      },
    };
  },
};

export default rule;
