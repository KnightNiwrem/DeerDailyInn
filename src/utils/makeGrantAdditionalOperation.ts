type MakeGrantAdditionalOperationOptions = {
  authCode: string;
  chtwrsToken: string;
  requestId: string;
};

const makeGrantAdditionalOperation = (options: MakeGrantAdditionalOperationOptions) => {
  const { authCode, chtwrsToken: token, requestId } = options;
  const message = JSON.stringify({
    token,
    action: 'grantAdditionalOperation',
    payload: { authCode, requestId },
  });
  return message;
};

export { makeGrantAdditionalOperation };
