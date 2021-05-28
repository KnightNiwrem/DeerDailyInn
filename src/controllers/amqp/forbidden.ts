import { isEmpty, isNil } from 'lodash-es';
import { User } from 'models/mod.js';
import { sendChtwrsMessage } from 'services/amqp.js';
import { makeAuthAdditionalOperation } from 'utils/makeAuthAdditionalOperation.js';

const forbidden = async (content: any) => {
  const telegramId = content.payload.userId;
  const operation = content.payload.requiredOperation;

  const user = await User.query().findOne({ telegramId });
  const chtwrsToken = user?.chtwrsToken ?? '';
  if (isNil(user) || isEmpty(chtwrsToken)) {
    return;
  }

  const request = makeAuthAdditionalOperation({ chtwrsToken, operation });
  await sendChtwrsMessage(request);
};

export { forbidden };
