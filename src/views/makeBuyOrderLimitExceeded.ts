type MakeBuyOrderLimitExceededOptions = {
  buyOrderLimit: number;
  itemName: string;
  price: number;
  quantity: number;
};

const makeBuyOrderLimitExceeded = (options: MakeBuyOrderLimitExceededOptions) => {
  const { buyOrderLimit, itemName, price, quantity } = options;
  return `Could not create buy order \
for ${quantity} ${itemName} at ${price} gold \
each. You can only have a total of ${buyOrderLimit} \
active buy orders at any given time.`;
};

export { makeBuyOrderLimitExceeded };
