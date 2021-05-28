const makeGetInfo = () => {
  const request = JSON.stringify({
    action: 'getInfo',
  });
  return request;
};

export { makeGetInfo };
