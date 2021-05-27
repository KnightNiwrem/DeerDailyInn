import { forEach, groupBy } from 'lodash';
import { DateTime } from 'luxon';
import type { Deal } from 'models/mod';

type MakeDealsOptions = {
  chtwrsId: string;
  deals: Deal[];
  dealType: string;
};

const makeDeals = (options: MakeDealsOptions) => {
  const { chtwrsId, deals, dealType } = options;
  const dealsByDate = groupBy(deals, (deal) => {
    const date = DateTime.fromISO(deal.created_at);
    return `${date.day}/${date.month}/${date.year}`;
  });

  let text = `Here are your last recorded ${dealType}:\n\n`;
  forEach(dealsByDate, (deals, date) => {
    text += `${date}:\n`;
    forEach(deals, (deal) => {
      const action = (deal.buyerId === chtwrsId) ? 'BOUGHT' : 'SOLD';
      const date = DateTime.fromISO(deal.created_at);
      const timeString = `${date.hour}:${date.minute}`;
      text += `${timeString}: ${action} ${deal.quantity} ${deal.item} at ${deal.price} gold each\n`;
    });
    text += '\n';
  });
  return text;
};

export { makeDeals };
