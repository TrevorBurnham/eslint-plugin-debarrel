import debarrel from "./rules/debarrel.js";

// Export rules as a named export
export const rules = {
  debarrel,
};

// Export as a default export
const plugin = {
  rules: {
    debarrel,
  },
}
export default plugin;
