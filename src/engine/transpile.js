import importExport from '@babel/plugin-transform-modules-commonjs'
import inlineImport from 'babel-plugin-inline-import'
import react from '@babel/preset-react'
import { transform } from '@babel/core'

const importCSS = ({ types: t }) => {
  return {
    visitor: {
      ImportDeclaration(path) {
        const givenPath = path.node.source.value
        if (givenPath.endsWith('.css')) {
          path.replaceWith(
            t.CallExpression(t.Identifier('requireCSS'), [
              t.StringLiteral(givenPath),
            ])
          )
        }
      },
    },
  }
}

const importExtractor = () => {
  return {
    visitor: {
      ImportDeclaration(path) {
        const programPath = path.findParent(parentPath =>
          parentPath.isProgram()
        )
        programPath.node.body = [path.node, ...programPath.node.body]
        path.remove()
      },
    },
  }
}

const yieldAwait = ({ types: t }) => {
  return {
    visitor: {
      AwaitExpression(path) {
        // we only want to yield-ify the top level await calls (as they are the only ones that sit inside our generator)
        let functionCount = 0,
          currentPath = path
        // count all Function types until the root is hit
        while (!currentPath.parentPath.isProgram()) {
          if (currentPath.parentPath.isFunction()) {
            functionCount++
          }
          currentPath = currentPath.parentPath
        }
        if (functionCount === 1) {
          path.replaceWith(t.YieldExpression(path.node.argument))
        }
      },
    },
  }
}

const rafWrapper = ({ types: t }) => {
  return {
    visitor: {
      CallExpression(path) {
        const callee = path.node.callee

        if (t.isIdentifier(callee) && callee.name === 'requestAnimationFrame') {
          callee.name = 'controlFlow'
          callee.property = t.identifier('raf')
          path.node.callee = t.memberExpression(callee, callee.property)
        }
      },
    },
  }
}

const timeoutWrapper = ({ types: t }) => {
  return {
    visitor: {
      CallExpression(path) {
        const callee = path.node.callee

        if (t.isIdentifier(callee) && callee.name === 'setTimeout') {
          callee.name = 'controlFlow'
          callee.property = t.identifier('timeout')
          path.node.callee = t.memberExpression(callee, callee.property)
        }
      },
    },
  }
}

export const transpile = (
  blockId,
  code,
  options = {
    plugins: [
      importCSS,
      importExtractor,
      rafWrapper,
      timeoutWrapper,
      [
        inlineImport,
        {
          extensions: ['.txt', '.md', '.css'],
        },
      ],
      importExport,
    ],
    presets: [react],
    parserOpts: {
      allowImportExportEverywhere: true,
    },
    //ast: true
  }
) => {
  const wrappedCode = `
    export default async function run(state, element, controlFlow, stateUpdated, onChange, html, md, __dirname){
      ${code}
    }

    //# sourceURL=http://blocks/${blockId}.js
  `

  return transform(wrappedCode, options)
}

export const esToCjs = (
  code,
  options = {
    plugins: [importExport],
  }
) => {
  return transform(code, options)
}
