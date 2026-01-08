const TYPE = { UNCHANGED: 'unchanged', ADDED: 'added', REMOVED: 'removed', MODIFIED: 'modified', TYPE_CHANGED: 'type_changed' }

const typeOf = (v) => {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
};

const isObj = (v) => v !== null && typeof v === 'object';

const keys = (a, b) => [...new Set([...Object.keys(a || {}), ...Object.keys(b || {})])];

const node = (key, type, left, right, extra = {}) => ({
  key,
  type,
  left,
  right,
  hasDiff: type !== TYPE.UNCHANGED,
  ...extra
});

const container = (val, isArr) => {
  if (isArr) return { isArray: true };
  if (isObj(val)) return { isObject: true };
  return {};
};

const childMap = (val, side) => (v, k) => node(
  k, TYPE.UNCHANGED,
  side === 'added' ? undefined : v,
  side === 'added' ? v : undefined,
  isObj(v) && { children: mapChildren(v, side), ...container(v, Array.isArray(v)) }
)

const mapChildren = (val, side) => {
  if (Array.isArray(val)) return val.map(childMap(val, side));
  if (isObj(val)) return Object.entries(val).map(([k, v]) => childMap(val, side)(v, k));
  return [];
};

const diffContainer = (left, right, key, isArr) => {
  const items = isArr
    ? Array.from({ length: Math.max(left?.length || 0, right?.length || 0) }, (_, i) => diff(left?.[i], right?.[i], i))
    : keys(left, right).map(k => diff(left?.[k], right?.[k], k))
  const hasDiff = items.some(c => c.hasDiff)
  return node(key, hasDiff ? TYPE.MODIFIED : TYPE.UNCHANGED, left, right, { children: items, ...container(left, isArr) })
}

const diff = (left, right, key = 'root') => {
  if (left === undefined) {
    const extra = isObj(right) ? { children: mapChildren(right, 'added'), ...container(right, Array.isArray(right)) } : {};
    return node(key, TYPE.ADDED, left, right, extra);
  }
  if (right === undefined) {
    const extra = isObj(left) ? { children: mapChildren(left, 'removed'), ...container(left, Array.isArray(left)) } : {};
    return node(key, TYPE.REMOVED, left, right, extra);
  }
  if (!isObj(left) && !isObj(right)) {
    if (left === right) return node(key, TYPE.UNCHANGED, left, right);
    if (typeOf(left) !== typeOf(right)) return node(key, TYPE.TYPE_CHANGED, left, right);
    return node(key, TYPE.MODIFIED, left, right);
  }
  if (typeOf(left) !== typeOf(right)) {
    return node(key, TYPE.TYPE_CHANGED, left, right, { children: [], ...container(left, Array.isArray(left)) });
  }
  return diffContainer(left, right, key, Array.isArray(left));
};

export { diff, TYPE }
