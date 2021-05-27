import type { User } from 'models/mod';

type MakeTransferOptions = {
  amount: number;
  fromUser: User;
  toUser: User;
};

const makeTransfer = (options: MakeTransferOptions) => {
  const { amount, fromUser, toUser } = options;
  return `Successfully transferred ${amount} gold \
from ${fromUser.telegramId} (New balance: ${fromUser.balance}) \
to ${toUser.telegramId} (New balance: ${toUser.balance}).`;
};

export { makeTransfer };
