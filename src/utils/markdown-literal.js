import MarkdownIt from 'markdown-it'

const mdInstance = MarkdownIt()

export const md = (...args) => {
  return mdInstance.render(String.raw(...args))
}
