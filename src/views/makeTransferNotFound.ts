import { isNil } from 'lodash-es';

import type { User } from 'models/mod.js';

type MakeTransferNotFoundOptions = {
  fromUser?: User;
  toUser?: User;
};

const makeTransferNotFound = (options: MakeTransferNotFoundOptions) => {
  const { fromUser, toUser } = options;
  return `Could not find fromUser or toUser.
fromUser: ${isNil(fromUser) ? 'Not found' : 'Found'}
toUser: ${isNil(toUser) ? 'Not found' : 'Found'}`;
};

export { makeTransferNotFound };
