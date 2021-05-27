import { isNil } from 'lodash';

import type { User } from 'models/mod';

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
