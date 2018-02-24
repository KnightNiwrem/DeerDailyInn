const makePaymentAuthorizationRequest = (chatwarsUserToken, localTid, pouchQuantity) => {
  const message = JSON.stringify({
    token: chatwarsUserToken,
    action: 'authorizePayment',
    payload: {
      amount: {
        pouches: pouchQuantity,
      },
      transactionId: localTid,
    }
  });
  return message;
};

const makePaymentConfirmationRequest = (chatwarsUserToken, localTid, confirmationCode, pouchQuantity) => {
  const message = JSON.stringify({
    token: chatwarsUserToken,
    action: 'pay',
    payload: {
      amount: {
        pouches: pouchQuantity
      },
      confirmationCode: confirmationCode,
      transactionId: localTid,
    }
  });
  return message;
};

const makePayoutRequest = (chatwarsUserToken, localTid, pouchQuantity) => {
  const message = JSON.stringify({
    token: chatwarsUserToken,  
    action: 'payout',  
    payload: {  
      transactionId: localTid, 
      amount: {  
        pouches: pouchQuantity
      },  
      message: `Deer Daily Inn has sent you ${pouchQuantity} pouches of gold!`,
    }
  });
  return message;
};

const makeGetInfoRequest = () => {
  const getInfo = JSON.stringify({
    action: 'getInfo'
  });
  return message;
};

module.exports = {
  makeAuthCodeRequest,
  makeTokenExchangeRequest,
  makePaymentAuthorizationRequest,
  makePaymentConfirmationRequest,
  makePayoutRequest,
  makeGetInfoRequest,
};
