import { items } from 'constants/items';

const itemsFromId = new Map(
  items.map(item => [item.id, item])
);

export { itemsFromId };
