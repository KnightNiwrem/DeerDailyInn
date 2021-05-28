const makeCreateAuthCode = (userId: number) => {
  const message = JSON.stringify({
    action: 'createAuthCode',
    payLoad: { userId },
  });
  return message;
};

export { makeCreateAuthCode };
