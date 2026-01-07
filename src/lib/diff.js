const TYPE = { UNCHANGED: 'unchanged', ADDED: 'added', REMOVED: 'removed', MODIFIED: 'modified', TYPE_CHANGED: 'type_changed' }

const typeOf = v => v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v
const isObj = v => v !== null && typeof v === 'object'
const keys = (a, b) => [...new Set([...Object.keys(a || {}), ...Object.keys(b || {})])]

const node = (key, type, left, right, extra = {}) => ({ key, type, left, right, hasDiff: type !== TYPE.UNCHANGED, ...extra })

const container = (val, isArr) => isArr ? { isArray: true } : isObj(val) ? { isObject: true } : {}

const childMap = (val, side) => (v, k) => node(
  k, TYPE.UNCHANGED,
  side === 'added' ? undefined : v,
  side === 'added' ? v : undefined,
  isObj(v) && { children: mapChildren(v, side), ...container(v, Array.isArray(v)) }
)

const mapChildren = (val, side) =>
  Array.isArray(val) ? val.map(childMap(val, side)) :
  isObj(val) ? Object.entries(val).map(([k, v]) => childMap(val, side)(v, k)) : []

const diffContainer = (left, right, key, isArr) => {
  const items = isArr
    ? Array.from({ length: Math.max(left?.length || 0, right?.length || 0) }, (_, i) => diff(left?.[i], right?.[i], i))
    : keys(left, right).map(k => diff(left?.[k], right?.[k], k))
  const hasDiff = items.some(c => c.hasDiff)
  return node(key, hasDiff ? TYPE.MODIFIED : TYPE.UNCHANGED, left, right, { children: items, ...container(left, isArr) })
}

const diff = (left, right, key = 'root') => {
  if (left === undefined) return node(key, TYPE.ADDED, left, right, isObj(right) && { children: mapChildren(right, 'added'), ...container(right, Array.isArray(right)) })
  if (right === undefined) return node(key, TYPE.REMOVED, left, right, isObj(left) && { children: mapChildren(left, 'removed'), ...container(left, Array.isArray(left)) })
  if (!isObj(left) && !isObj(right)) return node(key, left === right ? TYPE.UNCHANGED : typeOf(left) !== typeOf(right) ? TYPE.TYPE_CHANGED : TYPE.MODIFIED, left, right)
  if (typeOf(left) !== typeOf(right)) return node(key, TYPE.TYPE_CHANGED, left, right, { children: [], ...container(left, Array.isArray(left)) })
  return diffContainer(left, right, key, Array.isArray(left))
}

export { diff, TYPE }
