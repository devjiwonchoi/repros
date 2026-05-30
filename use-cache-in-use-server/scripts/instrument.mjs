// Layer-2 instrumentation: inject [ACTQ] timing logs into Next's client action
// queue so we can see enqueue -> run-start -> fetch from the inside.
// Patches BOTH the CJS (dist/client) and ESM (dist/esm/client) client builds,
// since which one the browser bundles can vary. Idempotent + revertible.
//
//   node scripts/instrument.mjs           # apply
//   node scripts/instrument.mjs --revert  # restore
//
// After applying/reverting you must rebuild: rm -rf .next && pnpm build

import { readFileSync, writeFileSync } from 'node:fs'

const L = (tag, id) =>
  `/*ACTQ*/try{console.log('[ACTQ]','${tag}',${id},performance.now().toFixed(1))}catch{}`

// Build the 8 patches for one client build dir. `fetchAnchor` differs between
// CJS (`(0, _fetch.fetch)`) and ESM (plain `fetch`); `callServer` anchor uses a
// common substring that appears in both `async function` and `export async function`.
function patchesFor(baseUrl, fetchAnchor) {
  const f = (p) => new URL(p, baseUrl).pathname
  const ARI = f('components/app-router-instance.js')
  const SAR = f('components/router-reducer/reducers/server-action-reducer.js')
  return [
    {
      file: f('app-call-server.js'),
      anchor: 'async function callServer(actionId, actionArgs) {',
      insert: L('callServer:enter', 'actionId'),
      pos: 'after',
    },
    {
      file: ARI,
      anchor: 'async function runAction({ actionQueue, action, setState }) {',
      insert: L('run:start', '(action.payload.actionId??action.payload.type)'),
      pos: 'after',
    },
    {
      file: ARI,
      anchor: '        action.resolve(nextState);',
      insert: L('run:complete', '(action.payload.actionId??action.payload.type)') + '\n        ',
      pos: 'before',
    },
    {
      file: ARI,
      anchor: '        // The queue is empty, so add the action and start it immediately',
      insert: '\n        ' + L('enqueue:run-now', '(payload.actionId??payload.type)'),
      pos: 'after',
    },
    {
      file: ARI,
      anchor: '        // Navigations (including back/forward) take priority over any pending actions.',
      insert: '\n        ' + L('enqueue:preempt', '(payload.actionId??payload.type)'),
      pos: 'after',
    },
    {
      file: ARI,
      anchor: '        // The queue is not empty, so add the action to the end of the queue',
      insert: '\n        ' + L('enqueue:queued', '(payload.actionId??payload.type)'),
      pos: 'after',
    },
    {
      file: SAR,
      anchor: fetchAnchor,
      insert: L('fetch:start', 'actionId') + '\n        ',
      pos: 'before',
    },
    {
      file: SAR,
      anchor: "        // If the fetch succeeds while we're in the offline state, notify the",
      insert: L('fetch:end', 'actionId') + '\n        ',
      pos: 'before',
    },
  ]
}

const patches = [
  ...patchesFor(
    new URL('../node_modules/next/dist/client/', import.meta.url),
    '        res = await (0, _fetch.fetch)(state.canonicalUrl, {'
  ),
  ...patchesFor(
    new URL('../node_modules/next/dist/esm/client/', import.meta.url),
    '        res = await fetch(state.canonicalUrl, {'
  ),
]

const revert = process.argv.includes('--revert')
let ok = 0
let miss = 0

for (const p of patches) {
  let src
  try {
    src = readFileSync(p.file, 'utf8')
  } catch {
    continue
  }

  if (revert) {
    if (src.includes(p.insert)) {
      writeFileSync(p.file, src.split(p.insert).join(''))
      ok++
    }
    continue
  }

  if (src.includes(p.insert)) {
    ok++ // already applied
    continue
  }
  if (!src.includes(p.anchor)) {
    console.warn('ANCHOR NOT FOUND:', JSON.stringify(p.anchor), 'in', p.file)
    miss++
    continue
  }
  const replacement = p.pos === 'after' ? p.anchor + p.insert : p.insert + p.anchor
  writeFileSync(p.file, src.replace(p.anchor, replacement))
  ok++
}

console.log(`${revert ? 'reverted' : 'applied'}: ${ok} ok, ${miss} missed`)
console.log('now: rm -rf .next && pnpm build && PORT=3126 pnpm start')
