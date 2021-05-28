type MakeAuthorizePaymentOptions = {
  amount: number;
  chtwrsToken: string;
  transactionId: number;
};

const makeAuthorizePayment = (options: MakeAuthorizePaymentOptions) => {
  const { amount, chtwrsToken: token, transactionId } = options;
  const message = JSON.stringify({
    token,
    action: 'authorizePayment',
    payLoad: {
      amount: {
        pouches: amount,
      },
      transactionId: `${transactionId}`,
    },
  });
  return message;
};

export { makeAuthorizePayment };
