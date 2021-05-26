import { isNil } from 'lodash';
import { User } from 'models/User';

const auth = async (content: any) => {
  const telegramId = content.payload.userId;
  const user = await User.findOne({ telegramId });
  if (!isNil(user)) {
    return;
  }

  await User.query().insert({ telegramId });
};

export { auth };
