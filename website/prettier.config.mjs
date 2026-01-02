/**
 * Prettier configuration.
 * All options are listed explicitly. The comments show the respective Prettier
 * default value. Where we deliberately deviate, it is noted.
 * Reference: https://prettier.io/docs/en/options.html
 *
 * @type {import("prettier").Config}
 */
const config = {
  // Line width to wrap at. Default: 80.
  // Deviation: 120, otherwise Tailwind className lines wrap heavily.
  printWidth: 120,

  // Width of one indentation level in spaces. Default: 2.
  tabWidth: 2,

  // Use tabs instead of spaces. Default: false.
  useTabs: false,

  // Semicolons at the end of statements. Default: true.
  semi: true,

  // Single instead of double quotes. Default: false (= double).
  singleQuote: false,

  // Quotes on object keys: "as-needed" | "consistent" | "preserve". Default: "as-needed".
  quoteProps: "as-needed",

  // Single quotes in JSX. Default: false (= double).
  jsxSingleQuote: false,

  // Trailing comma: "all" | "es5" | "none". Default: "all".
  trailingComma: "all",

  // Spaces inside object braces: { foo } instead of {foo}. Default: true.
  bracketSpacing: true,

  // Put the closing ">" of multiline JSX elements on its own line. Default: false.
  bracketSameLine: false,

  // Parentheses around single arrow-function params: "always" | "avoid". Default: "always".
  arrowParens: "always",

  // Only format when an @prettier/@format pragma is at the top of the file. Default: false.
  requirePragma: false,

  // Insert such a pragma automatically. Default: false.
  insertPragma: false,

  // Wrapping of prose (Markdown): "preserve" | "always" | "never". Default: "preserve".
  proseWrap: "preserve",

  // Whitespace handling in HTML: "css" | "strict" | "ignore". Default: "css".
  htmlWhitespaceSensitivity: "css",

  // Line ending: "lf" | "crlf" | "cr" | "auto". Default: "lf".
  endOfLine: "lf",

  // Also format embedded languages (e.g. CSS in template strings): "auto" | "off". Default: "auto".
  embeddedLanguageFormatting: "auto",

  // Force one JSX attribute per line. Default: false.
  singleAttributePerLine: false,

  // Plugins. The Tailwind plugin sorts CSS classes in the recommended order.
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
