type MakeWantToBuyOptions = {
  chtwrsToken: string;
  exactPrice: boolean;
  itemCode: string;
  quantity: number;
  price: number;
};

const makeWantToBuy = (options: MakeWantToBuyOptions) => {
  const {
    chtwrsToken: token,
    exactPrice,
    itemCode,
    quantity,
    price,
  } = options;
  const message = JSON.stringify({
    token,
    action: "wantToBuy",
    payload: { itemCode, quantity, price, exactPrice },
  });
  return message;
};

export { makeWantToBuy };
