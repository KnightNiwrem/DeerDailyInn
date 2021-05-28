import { items } from 'constants/items.js';

const itemsFromId = new Map(
  items.map(item => [item.id, item]),
);

export { itemsFromId };
