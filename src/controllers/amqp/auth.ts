import { isNil } from 'lodash-es';
import { User } from 'models/mod.js';

const auth = async (content: any) => {
  const telegramId = content.payload.userId;
  const user = await User.query().findOne({ telegramId });
  if (!isNil(user)) {
    return;
  }

  await User.query().insert({ telegramId });
};

export { auth };
