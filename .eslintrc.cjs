module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-case-declarations': 0,
    'no-unmodified-loop-condition': 0,
    'no-new-object': 0,
    'no-new-func': 0
  }
}
