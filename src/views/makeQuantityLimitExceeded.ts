type MakeQuantityLimitExceededOptions = {
  itemLimit: number;
  itemName: string;
  price: number;
  quantity: number;
};

const makeQuantityLimitExceeded = (options: MakeQuantityLimitExceededOptions) => {
  const {
    itemLimit,
    itemName,
    price,
    quantity,
  } = options;
  return `Could not create buy order for ${quantity} ${itemName} \
at ${price} gold each. The current buy order limit for this item \
is ${itemLimit}.`;
};

export { makeQuantityLimitExceeded };
