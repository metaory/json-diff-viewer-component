const TYPE = { UNCHANGED: 'unchanged', ADDED: 'added', REMOVED: 'removed', MODIFIED: 'modified' };

const typeOf = (v) => {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
};

const isObj = (v) => v !== null && typeof v === 'object';

const allKeys = (a, b) => [...new Set([...Object.keys(a || {}), ...Object.keys(b || {})])];

const createNode = (key, type, left, right, extra = {}) => ({
  key,
  type,
  left,
  right,
  hasDiff: type !== TYPE.UNCHANGED,
  ...extra
});

const getContainerProps = (val) => {
  if (Array.isArray(val)) return { isArray: true };
  if (isObj(val)) return { isObject: true };
  return {};
};

const mapChildrenForSide = (val, side) => {
  const createChildNode = (value, key) => {
    const leftValue = side === 'added' ? undefined : value;
    const rightValue = side === 'added' ? value : undefined;
    const childExtra = isObj(value) ? {
      children: mapChildrenForSide(value, side),
      ...getContainerProps(value)
    } : {};
    return createNode(key, TYPE.UNCHANGED, leftValue, rightValue, childExtra);
  };

  if (Array.isArray(val)) {
    return val.map((item, index) => createChildNode(item, index));
  }
  if (isObj(val)) {
    return Object.entries(val).map(([k, v]) => createChildNode(v, k));
  }
  return [];
};

const diffContainer = (left, right, key, isArr) => {
  const items = isArr
    ? Array.from({ length: Math.max(left?.length || 0, right?.length || 0) }, (_, i) => diff(left?.[i], right?.[i], i))
    : allKeys(left, right).map(k => diff(left?.[k], right?.[k], k));
  const hasDiff = items.some(c => c.hasDiff);
  return createNode(key, hasDiff ? TYPE.MODIFIED : TYPE.UNCHANGED, left, right, {
    children: items,
    ...getContainerProps(left)
  });
};

const diff = (left, right, key = 'root') => {
  if (left === undefined) {
    const extra = isObj(right) ? {
      children: mapChildrenForSide(right, 'added'),
      ...getContainerProps(right)
    } : {};
    return createNode(key, TYPE.ADDED, left, right, extra);
  }
  if (right === undefined) {
    const extra = isObj(left) ? {
      children: mapChildrenForSide(left, 'removed'),
      ...getContainerProps(left)
    } : {};
    return createNode(key, TYPE.REMOVED, left, right, extra);
  }
  if (!isObj(left) && !isObj(right)) {
    return createNode(key, left === right ? TYPE.UNCHANGED : TYPE.MODIFIED, left, right);
  }
  if (typeOf(left) !== typeOf(right)) {
    return createNode(key, TYPE.MODIFIED, left, right, {
      children: [],
      ...getContainerProps(left)
    });
  }
  return diffContainer(left, right, key, Array.isArray(left));
};

export { diff, TYPE };
