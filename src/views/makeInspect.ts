import { isNil } from 'lodash-es';

type MakeInspectOptions = {
  itemName: string;
  price: number;
  quantityAhead: number;
  quantityBehind?: number;
};

const makeInspect = (options: MakeInspectOptions) => {
  const {
    itemName,
    price,
    quantityAhead,
    quantityBehind,
  } = options;
  return isNil(quantityBehind)
    ? `There are ${quantityAhead} orders queueing to buy \
${itemName} at ${price} gold`
    : `There are ${quantityAhead} orders waiting in front \
of you to buy ${itemName} at ${price} gold.
There are ${quantityBehind} orders waiting behind you to \
buy ${itemName} at ${price} gold.`;
};

export { makeInspect };
