const rollCoffeeCheck = (buyOrderLimit: number) => {
  const factor = Math.max(10 - buyOrderLimit, 1);
  const successRate = (factor ** 2) / 100;
  return Math.random() < successRate;
};

export { rollCoffeeCheck };
