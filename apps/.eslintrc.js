module.exports = {
  'globals': {
    contract: true,
    describe: true,
    it: true,
  },
  rules: {
    'no-unused-vars': ['error', {
      'argsIgnorePattern': '^_',
    }],
  }
}
