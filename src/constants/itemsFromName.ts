import { items } from 'constants/items';

const itemsFromName = new Map(
  items.map(item => [item.name, item])
);

export { itemsFromName };
