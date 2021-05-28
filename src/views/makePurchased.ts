type MakePurchasedOptions = {
  buyerCastle: string;
  buyerName: string;
  itemName: string;
  price: number;
  quantity: number;
};

const makePurchased = (options: MakePurchasedOptions) => {
  const {
    buyerCastle,
    buyerName,
    itemName,
    price,
    quantity,
  } = options;

  return `${buyerCastle}${buyerName} purchased ${quantity} ${itemName} \
from you at ${price} gold each.`;
};

export { makePurchased };
