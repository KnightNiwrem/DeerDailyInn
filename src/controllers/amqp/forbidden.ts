import { User } from 'models/mod';
import { sendChtwrsMessage } from 'services/amqp';
import { makeAuthAdditionalOperation } from 'utils/makeAuthAdditionalOperation';

const forbidden = async (content: any) => {
  const telegramId = content.payload.userId;
  const operation = content.payload.requiredOperation;

  const user = await User
    .query()
    .where({ telegramId })
    .first();
  const chtwrsToken = user.chtwrsToken;
  const request = makeAuthAdditionalOperation({ operation, chtwrsToken: chtwrsToken! });
  await sendChtwrsMessage(request);
};

export { forbidden };
