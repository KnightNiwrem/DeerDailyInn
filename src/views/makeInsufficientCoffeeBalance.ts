type MakeInsufficientCoffeeBalanceOptions = {
  balance: number;
  cost: number;
};

const makeInsufficientCoffeeBalance = (options: MakeInsufficientCoffeeBalanceOptions) => {
  const { balance, cost } = options;
  return `Sorry! You need at least ${cost} gold \
to buy a cup of coffee, but you only have \
${balance} gold now.`;
};

export { makeInsufficientCoffeeBalance };
