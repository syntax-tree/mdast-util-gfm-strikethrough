import assert from 'node:assert/strict'
import test from 'node:test'
import {gfmStrikethrough} from 'micromark-extension-gfm-strikethrough'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {
  gfmStrikethroughFromMarkdown,
  gfmStrikethroughToMarkdown
} from 'mdast-util-gfm-strikethrough'
import {toMarkdown} from 'mdast-util-to-markdown'
import {removePosition} from 'unist-util-remove-position'

test('core', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(
      Object.keys(await import('mdast-util-gfm-strikethrough')).sort(),
      ['gfmStrikethroughFromMarkdown', 'gfmStrikethroughToMarkdown']
    )
  })
})

test('gfmStrikethroughFromMarkdown()', async function (t) {
  await t.test('should support strikethrough', async function () {
    const tree = fromMarkdown('a ~~b~~ c.', {
      extensions: [gfmStrikethrough()],
      mdastExtensions: [gfmStrikethroughFromMarkdown()]
    })

    removePosition(tree, {force: true})

    assert.deepEqual(tree, {
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
    })
  })

  await t.test('should support strikethrough w/ eols', async function () {
    const tree = fromMarkdown('a ~~b\nc~~ d.', {
      extensions: [gfmStrikethrough()],
      mdastExtensions: [gfmStrikethroughFromMarkdown()]
    })

    removePosition(tree, {force: true})

    assert.deepEqual(tree, {
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
    })
  })
})

test('gfmStrikethroughToMarkdown()', async function (t) {
  await t.test('should serialize strikethrough', async function () {
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
        {extensions: [gfmStrikethroughToMarkdown()]}
      ),
      'a ~~b~~ c.\n'
    )
  })

  await t.test('should serialize strikethrough w/ eols', async function () {
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
        {extensions: [gfmStrikethroughToMarkdown()]}
      ),
      'a ~~b\nc~~ d.\n'
    )
  })

  await t.test(
    'should not escape tildes in a `destinationLiteral`',
    async function () {
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
          {extensions: [gfmStrikethroughToMarkdown()]}
        ),
        '[](~a)\n'
      )
    }
  )

  await t.test(
    'should not escape tildes in a `destinationRaw`',
    async function () {
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
          {extensions: [gfmStrikethroughToMarkdown()]}
        ),
        '[link text](~a)\n'
      )
    }
  )

  await t.test('should not escape tildes in a `reference`', async function () {
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
        {extensions: [gfmStrikethroughToMarkdown()]}
      ),
      '[][~a]\n'
    )
  })

  await t.test(
    'should not escape tildes in a `title` (double quotes)',
    async function () {
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
          {extensions: [gfmStrikethroughToMarkdown()]}
        ),
        '[](# "~a")\n'
      )
    }
  )

  await t.test(
    'should not escape tildes in a `title` (single quotes)',
    async function () {
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
            extensions: [gfmStrikethroughToMarkdown()]
          }
        ),
        "[](# '~a')\n"
      )
    }
  )
})
