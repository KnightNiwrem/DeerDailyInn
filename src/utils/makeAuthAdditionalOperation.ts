type MakeAuthAdditionalOperationOptions = {
  chtwrsToken: string;
  operation: string;
};

const makeAuthAdditionalOperation = (options: MakeAuthAdditionalOperationOptions) => {
  const {
    chtwrsToken: token,
    operation,
  } = options;
  const message = JSON.stringify({  
    token,  
    action: "authAdditionalOperation",  
    payload: { operation },
  });
  return message;
};

export { makeAuthAdditionalOperation };
