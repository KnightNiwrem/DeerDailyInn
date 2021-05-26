type MakeInsufficientTransferBalanceOptions = {
  amount: number;
  balance: number;
};

const makeInsufficientTransferBalance = (
  options: MakeInsufficientTransferBalanceOptions
) => {
  const { amount, balance } = options;
  return `Could not transfer ${amount} gold from fromUser! \
Source user only have ${balance} gold in balance!`;
};

export { makeInsufficientTransferBalance };
