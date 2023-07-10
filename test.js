import assert from 'node:assert/strict'
import test from 'node:test'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {toMarkdown} from 'mdast-util-to-markdown'
import {removePosition} from 'unist-util-remove-position'
import {gfmStrikethrough} from 'micromark-extension-gfm-strikethrough'
import {
  gfmStrikethroughFromMarkdown,
  gfmStrikethroughToMarkdown
} from './index.js'
import * as mod from './index.js'

test('gfmStrikethroughFromMarkdown', () => {
  assert.deepEqual(
    Object.keys(mod).sort(),
    ['gfmStrikethroughFromMarkdown', 'gfmStrikethroughToMarkdown'],
    'should expose the public api'
  )

  const tree = fromMarkdown('a ~~b~~ c.', {
    extensions: [gfmStrikethrough()],
    mdastExtensions: [gfmStrikethroughFromMarkdown]
  })

  removePosition(tree, {force: true})

  assert.deepEqual(
    tree,
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

  const treeB = fromMarkdown('a ~~b\nc~~ d.', {
    extensions: [gfmStrikethrough()],
    mdastExtensions: [gfmStrikethroughFromMarkdown]
  })

  removePosition(treeB, {force: true})

  assert.deepEqual(
    treeB,
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
})

test('gfmStrikethroughToMarkdown', () => {
  assert.deepEqual(
    toMarkdown(
      {
        type: 'paragraph',
        children: [
          {type: 'text', value: 'a '},
          {type: 'delete', children: [{type: 'text', value: 'b'}]},
          {type: 'text', value: ' c.'}
        ]
      },
      {extensions: [gfmStrikethroughToMarkdown]}
    ),
    'a ~~b~~ c.\n',
    'should serialize strikethrough'
  )

  assert.deepEqual(
    toMarkdown(
      {
        type: 'paragraph',
        children: [
          {type: 'text', value: 'a '},
          {type: 'delete', children: [{type: 'text', value: 'b\nc'}]},
          {type: 'text', value: ' d.'}
        ]
      },
      {extensions: [gfmStrikethroughToMarkdown]}
    ),
    'a ~~b\nc~~ d.\n',
    'should serialize strikethrough w/ eols'
  )

  assert.equal(
    toMarkdown(
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: '~a',
            children: []
          }
        ]
      },
      {extensions: [gfmStrikethroughToMarkdown]}
    ),
    '[](~a)\n',
    'should not escape tildes in a `destinationLiteral`'
  )

  assert.equal(
    toMarkdown(
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: '~a',
            children: [{type: 'text', value: 'link text'}]
          }
        ]
      },
      {extensions: [gfmStrikethroughToMarkdown]}
    ),
    '[link text](~a)\n',
    'should not escape tildes in a `destinationRaw`'
  )

  assert.equal(
    toMarkdown(
      {
        type: 'paragraph',
        children: [
          {
            type: 'linkReference',
            identifier: '~a',
            referenceType: 'full',
            children: []
          }
        ]
      },
      {extensions: [gfmStrikethroughToMarkdown]}
    ),
    '[][~a]\n',
    'should not escape tildes in a `reference`'
  )

  assert.equal(
    toMarkdown(
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: '#',
            title: '~a',
            children: []
          }
        ]
      },
      {extensions: [gfmStrikethroughToMarkdown]}
    ),
    '[](# "~a")\n',
    'should not escape tildes in a `title` (double quotes)'
  )

  assert.equal(
    toMarkdown(
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: '#',
            title: '~a',
            children: []
          }
        ]
      },
      {
        quote: "'",
        extensions: [gfmStrikethroughToMarkdown]
      }
    ),
    "[](# '~a')\n",
    'should not escape tildes in a `title` (single quotes)'
  )
})
