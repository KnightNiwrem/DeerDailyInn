const makeCoffee = (isSuccessfulCoffee: boolean) => {
  const coffeeText = isSuccessfulCoffee
    ? `You feel a little more energetic to prowl the markets harder now!`
    : `But you still feel unsatisfied, somehow...`;
  return `You take a sip of your coffee...
${coffeeText}`;
};

export { makeCoffee };
