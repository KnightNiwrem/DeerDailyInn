type MakePayOptions = {
  amount: number;
  chtwrsToken: string;
  confirmationCode: string;
  transactionId: string;
}

const makePay = (options: MakePayOptions) => {
  const { amount, chtwrsToken: token, confirmationCode, transactionId } = options;
  const message = JSON.stringify({
    token,
    action: 'pay',
    payload: {
      confirmationCode,
      transactionId,
      amount: {
        pouches: amount
      },
    },
  });
  return message;
};

export { makePay };
