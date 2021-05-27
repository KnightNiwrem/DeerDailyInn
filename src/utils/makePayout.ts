type MakePayoutOptions = {
  amount: number;
  chtwrsToken: string;
  transactionId: number;
};

const makePayout = (options: MakePayoutOptions) => {
  const { amount, chtwrsToken: token, transactionId } = options;
  const message = JSON.stringify({
    action: 'payout',
    token,
    payLoad: {
      amount: {
        pouches: amount,
      },
      message: `You have withdrawn ${amount} gold pouch(es)!`,
      transactionId: `${transactionId}`,
    },
  });
  return message;
};

export { makePayout };
