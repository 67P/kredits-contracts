module.exports = {
  'env': {
    'browser': true,
    'es6': true,
    'node': true,
    'mocha': true
  },
  'extends': 'eslint:recommended',
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
    'artifacts': 'true',
    'contract': 'true',
    'accounts': 'true',
    'web3': 'true',
    'it': 'true',
    'assert': 'true'
  },
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module'
  },
  'rules': {
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'never',
      exports: 'never',
      functions: 'ignore',
    }],
    'eol-last': ['error', 'always'],
    semi: ['error', 'always'],
    'space-before-function-paren': ['error', {
      anonymous: 'never',
      named: 'always',
      asyncArrow: 'always',
    }],
  }
}
