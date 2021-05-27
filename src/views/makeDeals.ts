import { forEach, sortBy } from 'lodash';
import { DateTime } from 'luxon';
import type { Deal } from 'models/mod';

type MakeDealsOptions = {
  chtwrsId: string;
  deals: Deal[];
  dealType: string;
};

const makeDeals = (options: MakeDealsOptions) => {
  const { chtwrsId, deals, dealType } = options;
  const sortedDeals = sortBy(deals, deal => deal.created_at)
    .map(deal => {
      const date = DateTime.fromISO(deal.created_at);
      return { date, deal };
    });

  let previousDate = '';
  let text = `Here are your last recorded ${dealType}:\n\n`;
  forEach(sortedDeals, sortedDeal => {
    const { date, deal } = sortedDeal;
    const candidateDateHeader = `${date.day}/${date.month}/${date.year}`;
    if (previousDate !== candidateDateHeader) {
      text += `\n${candidateDateHeader}:\n`;
      previousDate = candidateDateHeader;
    }

    const action = (deal.buyerId === chtwrsId) ? 'BOUGHT' : 'SOLD';
    const { item, price, quantity } = deal;
    const time = `${date.hour}:${date.minute}`;
    text += `${time}: ${action} ${quantity} ${item} at ${price} gold each\n`;
  });
  return text;
};

export { makeDeals };
