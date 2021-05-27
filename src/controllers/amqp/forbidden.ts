import { isEmpty, isNil } from 'lodash';
import { User } from 'models/mod';
import { sendChtwrsMessage } from 'services/amqp';
import { makeAuthAdditionalOperation } from 'utils/makeAuthAdditionalOperation';

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
