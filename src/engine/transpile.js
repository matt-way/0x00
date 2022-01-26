import { transform } from '@babel/core'
import importExport from '@babel/plugin-transform-modules-commonjs'
import react from '@babel/preset-react'
import inlineImport from 'babel-plugin-inline-import'

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
        path.replaceWith(t.YieldExpression(path.node.argument))
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
      yieldAwait,
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
  const customRequire = ({ types: t }) => {
    return {
      visitor: {
        CallExpression(path) {
          // convert the import to a require call
          if (path.node.callee.name === 'require') {
            //path.node.callee.name = 'blockRequire'
            //path.node.arguments.push(t.StringLiteral(blockId))
          }
        },
      },
    }
  }

  options.plugins.push(customRequire)

  // due to to wanting to use yield without a generator def,
  // we wrap the entire code with a generator and then move any
  // import nodes to the top of the program
  const wrappedCode = `
    export default async function* run(state, currentTime, runOnce, stateUpdated, element, html, md, requireCSS){
      ${code}
    }
  `

  return transform(wrappedCode, options)
}
