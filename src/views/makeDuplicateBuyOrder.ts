type MakeDuplicateBuyOrderOptions = {
  itemName: string;
  price: number;
  quantity: number;
};

const makeDuplicateBuyOrder = (options: MakeDuplicateBuyOrderOptions) => {
  const { itemName, price, quantity } = options;
  return `Could not create buy order for ${quantity} \
${itemName} at ${price} gold each. You already have \
an active buy order for this item, and are only \
allowed one active buy order per item.`;
};

export { makeDuplicateBuyOrder };
