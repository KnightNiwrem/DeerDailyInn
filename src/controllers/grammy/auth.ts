import { isEmpty, isNil } from 'lodash-es';
import { sendChtwrsMessage } from 'services/amqp.js';
import { extractMatch } from 'utils/extractMatch.js';
import { makeGrantToken } from 'utils/makeGrantToken.js';
import { makeAuthorizationReceipt } from 'views/makeAuthorizationReceipt.js';
import { makeMissingArgument } from 'views/makeMissingArgument.js';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware.js';

const auth: TextMiddleware<Context> = async ctx => {
  const userId = ctx.from?.id;
  if (isNil(userId)) {
    return;
  }

  const [authCode] = extractMatch(ctx.match);
  if (isEmpty(authCode)) {
    const missingArgumentText = makeMissingArgument();
    await ctx.reply(missingArgumentText);
    throw new Error('Rejected in auth: Missing argument(s).');
  }

  const grantTokenRequest = makeGrantToken({ authCode, userId });
  await sendChtwrsMessage(grantTokenRequest);

  const authorizationReceiptText = makeAuthorizationReceipt();
  await ctx.reply(authorizationReceiptText);
};

export { auth };
