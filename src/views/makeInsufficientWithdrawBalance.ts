type MakeInsufficientWithdrawBalanceOptions = {
  amount: number;
  balance: number;
};

const makeInsufficientWithdrawBalance = (
  options: MakeInsufficientWithdrawBalanceOptions,
) => {
  const { amount, balance } = options;
  return `Sorry! You don't have sufficient funds to \
withdraw ${amount} gold pouches! Your current \
balance is ${balance} gold.`;
};

export { makeInsufficientWithdrawBalance };
