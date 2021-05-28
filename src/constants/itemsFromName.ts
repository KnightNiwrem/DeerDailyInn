import { items } from 'constants/items.js';
import { normalizeItemName } from 'utils/normalizeItemName.js';

const itemsFromName = new Map(
  items.map(item => [normalizeItemName(item.name), item]),
);

export { itemsFromName };
