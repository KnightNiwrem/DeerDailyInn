const makeNoPendingDeposit = () => {
  return `Sorry, we could not find any pending \
deposit actions that requires confirmation. If you wish to \
deposit gold pouches, please use the /deposit command first!
To deposit, please do:
/deposit [amount of gold pouches]`;
};

export { makeNoPendingDeposit };
