type MakeGrantTokenOptions = {
  authCode: string;
  userId: number;
};

const makeGrantToken = (options: MakeGrantTokenOptions) => {
  const { authCode, userId } = options;
  const message = JSON.stringify({
    action: 'grantToken',
    payload: { authCode, userId },
  });
  return message;
};

export { makeGrantToken };
