type MakeInfoOptions = {
  chatId: number;
  telegramId?: number;
};

const makeInfo = (options: MakeInfoOptions) => {
  const { chatId, telegramId } = options;
  return `Here is the requested info:
Chat Id: ${chatId}
Telegram Id: ${telegramId ?? 'None'}`;
};

export { makeInfo };
