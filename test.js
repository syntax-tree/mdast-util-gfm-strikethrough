var test = require('tape')
var fromMarkdown = require('mdast-util-from-markdown')
var toMarkdown = require('mdast-util-to-markdown')
var removePosition = require('unist-util-remove-position')
var syntax = require('micromark-extension-gfm-strikethrough')()
var strikethrough = require('.')

test('markdown -> mdast', function (t) {
  t.deepEqual(
    removePosition(
      fromMarkdown('a ~~b~~ c.', {
        extensions: [syntax],
        mdastExtensions: [strikethrough.fromMarkdown]
      }),
      true
    ),
    {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {type: 'text', value: 'a '},
            {type: 'delete', children: [{type: 'text', value: 'b'}]},
            {type: 'text', value: ' c.'}
          ]
        }
      ]
    },
    'should support strikethrough'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('a ~~b\nc~~ d.', {
        extensions: [syntax],
        mdastExtensions: [strikethrough.fromMarkdown]
      }),
      true
    ),
    {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {type: 'text', value: 'a '},
            {type: 'delete', children: [{type: 'text', value: 'b\nc'}]},
            {type: 'text', value: ' d.'}
          ]
        }
      ]
    },
    'should support strikethrough w/ eols'
  )

  t.end()
})

test('mdast -> markdown', function (t) {
  t.deepEqual(
    toMarkdown(
      {
        type: 'paragraph',
        children: [
          {type: 'text', value: 'a '},
          {type: 'delete', children: [{type: 'text', value: 'b'}]},
          {type: 'text', value: ' c.'}
        ]
      },
      {extensions: [strikethrough.toMarkdown]}
    ),
    'a ~~b~~ c.\n',
    'should serialize strikethrough'
  )

  t.deepEqual(
    toMarkdown(
      {
        type: 'paragraph',
        children: [
          {type: 'text', value: 'a '},
          {type: 'delete', children: [{type: 'text', value: 'b\nc'}]},
          {type: 'text', value: ' d.'}
        ]
      },
      {extensions: [strikethrough.toMarkdown]}
    ),
    'a ~~b\nc~~ d.\n',
    'should serialize strikethrough w/ eols'
  )

  t.end()
})
