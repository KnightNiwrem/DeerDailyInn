import { isEmpty, isNil } from 'lodash';
import { Deal } from 'models/Deal';
import { User } from 'models/User';
import { makeDeals } from 'views/makeDeals';
import { makeHistoryNotFound } from 'views/makeHistoryNotFound';
import { makeUnregistered } from 'views/makeUnregistered';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware';

const deals: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const user = await User.query().findOne({ telegramId });
  const chtwrsId = user?.chtwrsId;
  const isRegistered = !isNil(user) && !isEmpty(chtwrsId);
  if (!isRegistered) {
    const text = makeUnregistered();
    await ctx.reply(text);
    throw new Error(`Rejected in deals: User ${telegramId} is not registered.`);
  }

  const [command, ...searchTerms] = ctx.msg.text!.replace(/_/g, ' ').split(' ');
  const dealType = command.replace('/', '');
  const searchTerm = searchTerms.join(' ').replace(/[^\x00-\x7F]/g, '').trim();
  const deals = await Deal.query()
    .where(function() {
      if (dealType === 'purchases') {
        this.where('buyerId', user.chtwrsId!);
      } else if (dealType === 'sales') {
        this.where('sellerId', user.chtwrsId!);
      } else {
        this.where('buyerId', user.chtwrsId!).orWhere('sellerId', user.chtwrsId!);
      }
    })
    .where(function() {
      if (!isEmpty(searchTerm)) {
        this.where('item', searchTerm);
      }
    })
    .limit(20)
    .orderBy('created_at', 'desc');
  if (isEmpty(deals)) {
    const text = makeHistoryNotFound();
    await ctx.reply(text);
    throw new Error(`Rejected in deals: No history found for ${telegramId}\
${isEmpty(searchTerm) ? '' : ` with searchTerm: ${searchTerm}`}.`);
  }

  const text = makeDeals({ deals, dealType, chtwrsId: chtwrsId! });
  await ctx.reply(text);
};

export { deals };
