import { isEmpty, isNil } from 'lodash-es';
import { User } from 'models/User.js';
import { makeGrantAdditionalOperation } from 'utils/makeGrantAdditionalOperation.js';
import { sendChtwrsMessage } from 'services/amqp.js';
import { extractMatch } from 'utils/extractMatch.js';
import { makeAuthorizationReceipt } from 'views/makeAuthorizationReceipt.js';
import { makeMissingArgument } from 'views/makeMissingArgument.js';
import { makeUnregistered } from 'views/makeUnregistered.js';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware.js';

const authextra: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const [requestId, authCode] = extractMatch(ctx.match);
  if (isEmpty(authCode) || isEmpty(requestId)) {
    const text = makeMissingArgument();
    await ctx.reply(text);
    throw new Error('Rejected in authextra: Missing argument(s).');
  }

  const user = await User.query().findOne({ telegramId });
  const chtwrsToken = user?.chtwrsToken;
  const isRegistered = !isNil(user) && !isEmpty(chtwrsToken);
  if (!isRegistered) {
    const text = makeUnregistered();
    await ctx.reply(text);
    throw new Error(`Rejected in authextra: User ${telegramId} is not registered.`);
  }

  const request = makeGrantAdditionalOperation({ authCode, requestId, chtwrsToken: chtwrsToken! });
  await sendChtwrsMessage(request);

  const text = makeAuthorizationReceipt();
  await ctx.reply(text);
};

export { authextra };
