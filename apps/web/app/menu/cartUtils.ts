export interface CartItem {
  itemId: string;
  quantity: number;
  modifiers: string[];
  course: 'starter' | 'main' | 'dessert' | 'drinks';
  notes?: string;
}

export const generateCartKey = (itemId: string, modifiers: string[], course: string, notes?: string) => {
  return `${itemId}-${modifiers.slice().sort().join(',')}-${course}-${notes || ''}`;
};

export const migrateCart = (savedCartData: any): { [cartKey: string]: CartItem } => {
  if (!savedCartData) return {};
  try {
    const parsed = typeof savedCartData === 'string' ? JSON.parse(savedCartData) : savedCartData;
    const migrated: { [cartKey: string]: CartItem } = {};
    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof value === 'number') {
        const course = key.startsWith('start-') ? 'starter' : key.startsWith('dess-') ? 'dessert' : key.startsWith('drink-') ? 'drinks' : 'main';
        const newKey = generateCartKey(key, [], course);
        migrated[newKey] = {
          itemId: key,
          quantity: value,
          modifiers: [],
          course: course
        };
      } else if (value && typeof value === 'object' && 'itemId' in (value as any)) {
        const ci = value as CartItem;
        const correctKey = generateCartKey(ci.itemId, ci.modifiers || [], ci.course, ci.notes);
        migrated[correctKey] = ci;
      }
    });
    return migrated;
  } catch (e) {
    console.error('Cart migration failed:', e);
    return {};
  }
};
