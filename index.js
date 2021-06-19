import containerPhrasing from 'mdast-util-to-markdown/lib/util/container-phrasing.js'

export const gfmStrikethroughFromMarkdown = {
  canContainEols: ['delete'],
  enter: {strikethrough: enterStrikethrough},
  exit: {strikethrough: exitStrikethrough}
}

export const gfmStrikethroughToMarkdown = {
  unsafe: [{character: '~', inConstruct: 'phrasing'}],
  handlers: {delete: handleDelete}
}

handleDelete.peek = peekDelete

function enterStrikethrough(token) {
  this.enter({type: 'delete', children: []}, token)
}

function exitStrikethrough(token) {
  this.exit(token)
}

function handleDelete(node, _, context) {
  var exit = context.enter('emphasis')
  var value = containerPhrasing(node, context, {before: '~', after: '~'})
  exit()
  return '~~' + value + '~~'
}

function peekDelete() {
  return '~'
}
