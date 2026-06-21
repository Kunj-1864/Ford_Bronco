/**
 * Parse Ford Bronco GLB directly (no Three.js browser deps).
 * Extracts: scene nodes, mesh names, accessor bounding boxes.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const buf = readFileSync(path.resolve(__dirname, '../public/2021_ford_bronco_2-door.glb'))

// ── GLB binary layout ──────────────────────────────────────────
// [12 byte header][chunk0: JSON][chunk1: BIN]
const magic   = buf.readUInt32LE(0)
const version = buf.readUInt32LE(4)
if (magic !== 0x46546C67) { console.error('Not a GLB file'); process.exit(1) }

const chunk0Len  = buf.readUInt32LE(12)
const jsonStr    = buf.toString('utf8', 20, 20 + chunk0Len)
const gltf       = JSON.parse(jsonStr)

const binOffset  = 20 + chunk0Len + 8  // skip chunk1 header (8 bytes)
const binBuf     = buf.slice(binOffset)

function getAccessorData(idx) {
  const acc  = gltf.accessors[idx]
  const bv   = gltf.bufferViews[acc.bufferView]
  const off  = (bv.byteOffset || 0) + (acc.byteOffset || 0)
  const type = acc.componentType  // 5126 = FLOAT
  const count= acc.count
  const numC = acc.type === 'VEC3' ? 3 : acc.type === 'VEC2' ? 2 : 1

  if (type !== 5126) return null  // only floats

  const floats = []
  for (let i = 0; i < count; i++) {
    const tuple = []
    for (let c = 0; c < numC; c++) {
      tuple.push(binBuf.readFloatLE(off + (i * numC + c) * 4))
    }
    floats.push(tuple)
  }
  return floats
}

function getAccessorBounds(idx) {
  const acc = gltf.accessors[idx]
  // GLB stores min/max in accessor if available
  if (acc.min && acc.max) {
    return { min: acc.min, max: acc.max, fromHeader: true }
  }
  // fallback: scan data
  const data = getAccessorData(idx)
  if (!data || data.length === 0) return null
  const min = [...data[0]], max = [...data[0]]
  for (const pt of data) {
    for (let i = 0; i < pt.length; i++) {
      if (pt[i] < min[i]) min[i] = pt[i]
      if (pt[i] > max[i]) max[i] = pt[i]
    }
  }
  return { min, max }
}

console.log('\n══════════════════════════════════════════════════════')
console.log('  FORD BRONCO GLB — RAW ANALYSIS')
console.log('══════════════════════════════════════════════════════')
console.log(`GLB version: ${version}`)
console.log(`Meshes:    ${gltf.meshes?.length || 0}`)
console.log(`Nodes:     ${gltf.nodes?.length || 0}`)
console.log(`Materials: ${gltf.materials?.length || 0}`)
console.log(`Textures:  ${gltf.textures?.length || 0}`)

// ── Overall model AABB from all position accessors ─────────────
let gMin = [Infinity, Infinity, Infinity]
let gMax = [-Infinity, -Infinity, -Infinity]

const meshBounds = {}

for (let mi = 0; mi < (gltf.meshes || []).length; mi++) {
  const mesh = gltf.meshes[mi]
  let mMin = [Infinity, Infinity, Infinity]
  let mMax = [-Infinity, -Infinity, -Infinity]

  for (const prim of (mesh.primitives || [])) {
    const posIdx = prim.attributes?.POSITION
    if (posIdx == null) continue
    const b = getAccessorBounds(posIdx)
    if (!b) continue
    for (let i = 0; i < 3; i++) {
      if (b.min[i] < mMin[i]) mMin[i] = b.min[i]
      if (b.max[i] > mMax[i]) mMax[i] = b.max[i]
      if (b.min[i] < gMin[i]) gMin[i] = b.min[i]
      if (b.max[i] > gMax[i]) gMax[i] = b.max[i]
    }
  }
  meshBounds[mi] = { min: mMin, max: mMax,
    cx: (mMin[0]+mMax[0])/2, cy: (mMin[1]+mMax[1])/2, cz: (mMin[2]+mMax[2])/2,
    sx: mMax[0]-mMin[0], sy: mMax[1]-mMin[1], sz: mMax[2]-mMin[2]
  }
}

const gSize = [gMax[0]-gMin[0], gMax[1]-gMin[1], gMax[2]-gMin[2]]
console.log('\n─── OVERALL BOUNDING BOX ───')
console.log(`  min: (${gMin.map(v=>v.toFixed(4)).join(', ')})`)
console.log(`  max: (${gMax.map(v=>v.toFixed(4)).join(', ')})`)
console.log(`  size X=${gSize[0].toFixed(4)}  Y=${gSize[1].toFixed(4)}  Z=${gSize[2].toFixed(4)}`)
console.log(`  center: (${((gMin[0]+gMax[0])/2).toFixed(4)}, ${((gMin[1]+gMax[1])/2).toFixed(4)}, ${((gMin[2]+gMax[2])/2).toFixed(4)})`)

// ── All materials (names tell us a LOT) ───────────────────────
console.log('\n─── MATERIALS ───')
;(gltf.materials || []).forEach((m, i) => {
  console.log(`  [${String(i).padStart(3)}] ${m.name || '(unnamed)'}`)
})

// ── Mesh list with bounds ──────────────────────────────────────
console.log('\n─── MESHES with BOUNDS (model-space, unsorted) ───')
console.log('Idx  Name'.padEnd(50) + 'Center (x,y,z)'.padEnd(35) + 'Size (x,y,z)')
console.log('─'.repeat(110))

;(gltf.meshes || []).forEach((mesh, mi) => {
  const b = meshBounds[mi]
  const cx = isFinite(b.cx) ? b.cx.toFixed(3) : '?'
  const cy = isFinite(b.cy) ? b.cy.toFixed(3) : '?'
  const cz = isFinite(b.cz) ? b.cz.toFixed(3) : '?'
  const sx = isFinite(b.sx) ? b.sx.toFixed(3) : '?'
  const sy = isFinite(b.sy) ? b.sy.toFixed(3) : '?'
  const sz = isFinite(b.sz) ? b.sz.toFixed(3) : '?'
  const name = (mesh.name || '(unnamed)').substring(0,45).padEnd(46)
  console.log(`[${String(mi).padStart(3)}] ${name}(${cx},${cy},${cz})`.padEnd(84) + `${sx}×${sy}×${sz}`)
})

// ── Keyword search across mesh names + material names ─────────
const kws = ['wheel','tire','door','light','lamp','glass','hood','roof',
             'mirror','grill','bumper','window','seat','body','frame']

console.log('\n─── KEY PART SEARCH ───')
for (const kw of kws) {
  const hits = (gltf.meshes || []).filter((m,i) => {
    const mn = (m.name||'').toLowerCase()
    // also check the material name of first primitive
    const matIdx = m.primitives?.[0]?.material
    const matName = matIdx != null ? (gltf.materials?.[matIdx]?.name||'').toLowerCase() : ''
    return mn.includes(kw) || matName.includes(kw)
  })
  if (!hits.length) continue
  console.log(`\n  [${kw.toUpperCase()}] — ${hits.length} match(es)`)
  hits.forEach(m => {
    const mi = gltf.meshes.indexOf(m)
    const b  = meshBounds[mi]
    const matIdx = m.primitives?.[0]?.material
    const matName = gltf.materials?.[matIdx]?.name || ''
    console.log(`    Mesh[${mi}] "${m.name||'?'}" | mat: "${matName}"`)
    if (isFinite(b.cx)) {
      console.log(`      center=(${b.cx.toFixed(3)}, ${b.cy.toFixed(3)}, ${b.cz.toFixed(3)})  size=${b.sx.toFixed(3)}×${b.sy.toFixed(3)}×${b.sz.toFixed(3)}  minY=${b.min[1].toFixed(3)}`)
    }
  })
}

console.log('\n══════════════════════════════════════════════════════\n')
