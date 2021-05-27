import { items } from 'constants/items';
import { normalizeItemName } from 'utils/normalizeItemName';

const itemsFromName = new Map(
  items.map(item => [normalizeItemName(item.name), item]),
);

export { itemsFromName };
