import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import jsdoc from "eslint-plugin-jsdoc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Next.js best practices incl. TypeScript and React rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Static export with unoptimized images -> intentionally plain <img>, no next/image
      "@next/next/no-img-element": "off",
    },
  },
  // Documentation requirement (JSDoc) for our own source - reports missing docs
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "features/**/*.{ts,tsx}", "scripts/**/*.mjs"],
    plugins: { jsdoc },
    rules: {
      // every file needs an @module header
      "jsdoc/require-file-overview": [
        "warn",
        { tags: { module: { mustExist: true, preventDuplicates: true, initialCommentsOnly: true } } },
      ],
      // functions, methods, classes, types and interfaces need JSDoc
      "jsdoc/require-jsdoc": [
        "warn",
        {
          require: { FunctionDeclaration: true, MethodDefinition: true, ClassDeclaration: true },
          contexts: ["TSInterfaceDeclaration", "TSTypeAliasDeclaration"],
        },
      ],
      // params must be documented and match the real names.
      // Destructured props (e.g. React components) are exempt - they are
      // documented on the props interface.
      "jsdoc/require-param": ["warn", { checkDestructured: false, checkDestructuredRoots: false }],
      "jsdoc/require-param-description": "warn",
      "jsdoc/check-param-names": "warn",
      // do not put types in JSDoc (they are already in the code)
      "jsdoc/no-types": "warn",
    },
  },
  // strict naming conventions (only .ts/.tsx - needs the TS parser)
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "features/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/naming-convention": [
        "warn",
        // default: camelCase
        { selector: "default", format: ["camelCase"], leadingUnderscore: "allow", trailingUnderscore: "allow" },
        // variables: camelCase, constants UPPER_CASE, components/values PascalCase
        { selector: "variable", format: ["camelCase", "UPPER_CASE", "PascalCase"], leadingUnderscore: "allow" },
        // PascalCase allowed for parameters holding a React component (<Icon />)
        { selector: "parameter", format: ["camelCase", "PascalCase"], leadingUnderscore: "allow" },
        // functions: camelCase, React components PascalCase
        { selector: "function", format: ["camelCase", "PascalCase"] },
        // types, interfaces, classes, enums: PascalCase
        { selector: "typeLike", format: ["PascalCase"] },
        { selector: "enumMember", format: ["PascalCase", "UPPER_CASE"] },
        { selector: "import", format: ["camelCase", "PascalCase"] },
        // do not enforce object/type properties (data/display maps, external keys)
        { selector: ["objectLiteralProperty", "typeProperty"], format: null },
      ],
      // avoid magic numbers: meaningful numbers as named constants
      "@typescript-eslint/no-magic-numbers": [
        "warn",
        {
          ignore: [0, 1, -1, 2, 100],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreEnums: true,
          ignoreReadonlyClassProperties: true,
          enforceConst: true,
        },
      ],
      // exported (module-boundary) functions need explicit return types
      "@typescript-eslint/explicit-module-boundary-types": "warn",
    },
  },
  // Test files: literal numbers are part of the fixtures/expectations
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-magic-numbers": "off",
    },
  },
  {
    ignores: [".next/**", "out/**", "node_modules/**", "docs/api/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
