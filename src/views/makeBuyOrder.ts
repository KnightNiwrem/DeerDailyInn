type MakeBuyOrderOptions = {
  itemName: string;
  price: number;
  quantity: number;
};

const makeBuyOrder = (options: MakeBuyOrderOptions) => {
  const { itemName, price, quantity } = options;
  return `Your buy order for ${quantity} ${itemName} \
at ${price} each, has been received!
An impossible /wtb has also been executed to check if \
you have permissions. If you see a permission request \
message, please provide extra permissions so that your \
buy order can work!`;
};

export { makeBuyOrder };
