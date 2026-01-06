const TYPES = { UNCHANGED: 'unchanged', ADDED: 'added', REMOVED: 'removed', MODIFIED: 'modified', TYPE_CHANGED: 'type_changed' }

const getType = v => v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v

const isPrimitive = v => v === null || typeof v !== 'object'

const diffPrimitive = (left, right, key) => {
  if (left === right) return { key, type: TYPES.UNCHANGED, left, right, hasDiff: false }
  if (getType(left) !== getType(right)) return { key, type: TYPES.TYPE_CHANGED, left, right, hasDiff: true }
  return { key, type: TYPES.MODIFIED, left, right, hasDiff: true }
}

const diffArray = (left, right, key) => {
  const len = Math.max(left?.length || 0, right?.length || 0)
  const children = Array.from({ length: len }, (_, i) => diff(left?.[i], right?.[i], i))
  const hasDiff = children.some(c => c.hasDiff)
  return { key, type: hasDiff ? TYPES.MODIFIED : TYPES.UNCHANGED, left, right, children, hasDiff, isArray: true }
}

const diffObject = (left, right, key) => {
  const keys = [...new Set([...Object.keys(left || {}), ...Object.keys(right || {})])]
  const children = keys.map(k => diff(left?.[k], right?.[k], k))
  const hasDiff = children.some(c => c.hasDiff)
  return { key, type: hasDiff ? TYPES.MODIFIED : TYPES.UNCHANGED, left, right, children, hasDiff, isObject: true }
}

const diff = (left, right, key = 'root') => {
  if (left === undefined && right !== undefined) return { key, type: TYPES.ADDED, left, right, hasDiff: true, ...(!isPrimitive(right) && { children: diffChildren(right), isArray: Array.isArray(right), isObject: !Array.isArray(right) && typeof right === 'object' }) }
  if (left !== undefined && right === undefined) return { key, type: TYPES.REMOVED, left, right, hasDiff: true, ...(!isPrimitive(left) && { children: diffChildren(left), isArray: Array.isArray(left), isObject: !Array.isArray(left) && typeof left === 'object' }) }
  if (isPrimitive(left) && isPrimitive(right)) return diffPrimitive(left, right, key)
  if (getType(left) !== getType(right)) return { key, type: TYPES.TYPE_CHANGED, left, right, hasDiff: true, children: [], isArray: Array.isArray(left) || Array.isArray(right), isObject: !Array.isArray(left) && typeof left === 'object' }
  if (Array.isArray(left)) return diffArray(left, right, key)
  return diffObject(left, right, key)
}

const diffChildren = val => {
  if (Array.isArray(val)) return val.map((v, i) => ({ key: i, type: TYPES.UNCHANGED, left: v, right: v, hasDiff: false, ...(!isPrimitive(v) && { children: diffChildren(v), isArray: Array.isArray(v), isObject: !Array.isArray(v) && typeof v === 'object' }) }))
  if (typeof val === 'object' && val !== null) return Object.entries(val).map(([k, v]) => ({ key: k, type: TYPES.UNCHANGED, left: v, right: v, hasDiff: false, ...(!isPrimitive(v) && { children: diffChildren(v), isArray: Array.isArray(v), isObject: !Array.isArray(v) && typeof v === 'object' }) }))
  return []
}

export { diff, TYPES }
