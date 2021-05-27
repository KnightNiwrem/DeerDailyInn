const unknown = async (content: any) => {
  console.warn(`Inbound queue: ${content.action} returned status code ${content.result}`);
};

export { unknown };
