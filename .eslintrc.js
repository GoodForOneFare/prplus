/* eslint-env node */
module.exports = {
  env: {
    node: false,
    browser: true,
  },
  extends: [
    'plugin:@shopify/typescript',
    'plugin:@shopify/prettier',
    'plugin:@shopify/react',
  ],
  rules: {
    // Superseded by label-has-associated-control.
    'jsx-a11y/label-has-for': 0,
  },
};
