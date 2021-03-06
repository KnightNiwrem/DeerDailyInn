import { itemsFromName } from 'constants/itemsFromName.js';
import { isEmpty, isNil } from 'lodash-es';
import { Deal } from 'models/Deal.js';
import { User } from 'models/User.js';
import { normalizeItemName } from 'utils/normalizeItemName.js';
import { makeDeals } from 'views/makeDeals.js';
import { makeHistoryNotFound } from 'views/makeHistoryNotFound.js';
import { makeUnregistered } from 'views/makeUnregistered.js';

import type { Context } from 'grammy';
import type { TextMiddleware } from 'utils/types/TextMiddleware.js';

const deals: TextMiddleware<Context> = async ctx => {
  const telegramId = ctx.from?.id;
  if (isNil(telegramId)) {
    return;
  }

  const user = await User.query().findOne({ telegramId });
  const chtwrsId = user?.chtwrsId ?? '';
  const isRegistered = !isNil(user) && !isEmpty(chtwrsId);
  if (!isRegistered) {
    const text = makeUnregistered();
    await ctx.reply(text);
    throw new Error(`Rejected in deals: User ${telegramId} is not registered.`);
  }

  const [command, ...searchTerms] = ctx.msg.text!.replace(/_/g, ' ').split(' ');
  const dealType = command.replace('/', '');
  const normalizedItemName = normalizeItemName(searchTerms.join(' '));
  const itemName = itemsFromName.get(normalizedItemName)?.name ?? '';
  let userDealsQuery = Deal.query();
  if (dealType === 'purchases') {
    userDealsQuery = userDealsQuery.where({ buyerId: chtwrsId });
  } else if (dealType === 'sales') {
    userDealsQuery = userDealsQuery.where({ sellerId: chtwrsId });
  } else {
    userDealsQuery = userDealsQuery
      .where({ buyerId: chtwrsId })
      .orWhere({ sellerId: chtwrsId });
  }
  if (!isEmpty(itemName)) {
    userDealsQuery = userDealsQuery.where({ item: itemName });
  }

  const userDeals = await userDealsQuery
    .limit(20)
    .orderBy('created_at', 'desc');
  if (isEmpty(userDeals)) {
    const text = makeHistoryNotFound();
    await ctx.reply(text);
    throw new Error(`Rejected in deals: No history found for ${telegramId}\
${isEmpty(itemName) ? '' : ` with searchTerm: ${itemName}`}.`);
  }

  const text = makeDeals({ chtwrsId, dealType, deals: userDeals });
  await ctx.reply(text);
};

export { deals };
