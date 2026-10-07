import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { apply, resolvePromptPath, seedPrompt } from '../prompt-reader.mjs'

test('seeds the requested Markdown file without overwriting it', () => {
  const root = mkdtempSync(join(tmpdir(), 'dsh-chinese-minimal-'))
  const prompt = join(root, 'prompt.md')
  try {
    assert.equal(seedPrompt(prompt, '你是一个中文助手\n'), true)
    assert.equal(seedPrompt(prompt, '不要覆盖\n'), false)
    assert.equal(readFileSync(prompt, 'utf8'), '你是一个中文助手\n')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('registers a complete literal system prompt and suppresses runtime context', () => {
  const root = mkdtempSync(join(tmpdir(), 'dsh-chinese-minimal-'))
  const prompt = join(root, 'prompt.md')
  let section
  let suppressed = false
  const ctx = {
    systemPrompt: {
      suppressRuntimeContext() {
        suppressed = true
      },
      section(value) {
        section = value
        return () => {}
      },
    },
    effect(register) {
      return register()
    },
  }
  try {
    apply(ctx, { path: prompt })
    assert.equal(suppressed, true)
    assert.equal(section.complete, true)
    assert.equal(section.interpolate, false)
    assert.equal(section.text(), '你是一个中文助手\n')
    assert.equal(resolvePromptPath(prompt), prompt)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
