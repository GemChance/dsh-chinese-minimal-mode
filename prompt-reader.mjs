import { closeSync, mkdirSync, openSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PREFIX_SECTION = 'deployment:persona-prefix'
const PREFIX_ORDER = 0
const PACKAGE_DEFAULT_PATH = fileURLToPath(new URL('./default-prompt.md', import.meta.url))

function harnessHome() {
  return process.env.DSH_HOME ? resolve(process.env.DSH_HOME) : join(homedir(), '.dsh')
}

export function resolvePromptPath(input) {
  if (typeof input !== 'string' || input.trim() === '') {
    return join(harnessHome(), 'prompts', 'chinese-assistant.md')
  }
  if (input === '~') return homedir()
  if (input.startsWith('~/')) return join(homedir(), input.slice(2))
  return resolve(input)
}

export function defaultPrompt() {
  return readFileSync(PACKAGE_DEFAULT_PATH, 'utf8')
}

export function seedPrompt(path, initialText = defaultPrompt()) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 })
  let fd
  try {
    fd = openSync(path, 'wx', 0o600)
    writeFileSync(fd, initialText, 'utf8')
    return true
  } catch (error) {
    if (error?.code === 'EEXIST') return false
    throw error
  } finally {
    if (fd !== undefined) closeSync(fd)
  }
}

class PromptFile {
  constructor(path, fallback) {
    this.path = path
    this.fallback = fallback
    this.text = undefined
    this.mtimeMs = -1
    this.size = -1
  }

  read() {
    try {
      const info = statSync(this.path)
      if (this.text !== undefined && info.mtimeMs === this.mtimeMs && info.size === this.size) {
        return this.text
      }
      const next = readFileSync(this.path, 'utf8')
      if (next.trim() !== '') this.text = next
      this.mtimeMs = info.mtimeMs
      this.size = info.size
    } catch {
      // Preserve the last known-good prompt; otherwise use the packaged default.
    }
    return this.text ?? this.fallback
  }
}

export const name = 'chinese-minimal-prompt-file'
export const inject = ['systemPrompt']

export function apply(ctx, config = {}) {
  const path = resolvePromptPath(config.path)
  const fallback = defaultPrompt()
  try {
    seedPrompt(path, fallback)
  } catch (error) {
    console.error(`chinese-minimal-mode: 无法创建默认提示词 ${path}: ${error?.message ?? error}`)
  }

  const file = new PromptFile(path, fallback)
  if (config.includeRuntimeContext !== true) ctx.systemPrompt.suppressRuntimeContext()

  ctx.effect(
    () =>
      ctx.systemPrompt.section({
        name: PREFIX_SECTION,
        order: PREFIX_ORDER,
        text: () => file.read(),
        interpolate: false,
        complete: config.complete !== false,
      }),
    'chinese-minimal.prompt',
  )
}
