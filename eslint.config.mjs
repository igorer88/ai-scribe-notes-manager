import path from 'node:path'
import { fileURLToPath } from 'node:url'

import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import { fixupPluginRules } from '@eslint/compat'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
import nodePlugin from 'eslint-plugin-node'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

import {
  eslintBaseRules,
  eslintImportOrderRules,
  eslintNodeRules,
  typescriptEslintRules
} from './config/linter/index.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const tsFiles = ['{src,tests}/**/*.ts']
const webAppFiles = ['web/src/**/*.{ts,tsx}']
const webConfigFiles = ['web/*.{ts,tsx}']

const languageOptions = {
  globals: {
    ...globals.node,
    ...globals.jest
  },
  ecmaVersion: 2023,
  sourceType: 'module'
}

const customTypescriptConfig = {
  files: tsFiles,
  plugins: {
    '@typescript-eslint': typescriptEslintEslintPlugin,
    import: importPlugin,
    node: fixupPluginRules(nodePlugin)
  },
  languageOptions: {
    ...languageOptions,
    parser: tsParser,
    parserOptions: {
      project: 'tsconfig.json',
      tsconfigRootDir: __dirname
    }
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: path.resolve(__dirname, 'tsconfig.json')
      },
      node: {
        paths: [path.resolve(__dirname, 'src')],
        extensions: ['.js', '.ts', '.d.ts']
      }
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.d.ts']
    }
  },
  rules: {
    ...eslintBaseRules,
    ...eslintImportOrderRules,
    ...eslintNodeRules,
    ...typescriptEslintRules
  }
}

const recommendedTypeScriptConfigs = [
  {
    files: tsFiles,
    plugins: {
      '@typescript-eslint': typescriptEslintEslintPlugin
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      ...typescriptEslintEslintPlugin.configs.recommended.rules,
      ...typescriptEslintEslintPlugin.configs.stylistic.rules
    }
  }
]

const customWebAppConfig = {
  files: webAppFiles,
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh
  },
  languageOptions: {
    ...languageOptions,
    parser: tsParser,
    globals: {
      ...globals.browser
    },
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      },
      project: 'web/tsconfig.app.json',
      tsconfigRootDir: __dirname
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    ...reactPlugin.configs.recommended.rules,
    ...reactHooks.configs.recommended.rules,
    'react-refresh/only-export-components': 'warn',
    'react/react-in-jsx-scope': 'off'
  }
}

const customWebConfig = {
  files: webConfigFiles,
  languageOptions: {
    ...languageOptions,
    parser: tsParser,
    globals: {
      ...globals.node
    },
    parserOptions: {
      project: 'web/tsconfig.node.json',
      tsconfigRootDir: __dirname
    }
  }
}

export default [
  {
    ignores: [
      '**/.eslintrc.cjs',
      '**/node_modules/**',
      '**/coverage/**',
      'docs/*',
      'build/*',
      'lib/*',
      'dist/*',
      'src/metadata.ts',
      'web/dist/*'
    ]
  },
  ...recommendedTypeScriptConfigs,
  customTypescriptConfig,
  customWebAppConfig,
  customWebConfig
]
