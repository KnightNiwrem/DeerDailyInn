import type { BuyOrder } from 'models/mod.js';

type MakeOrdersOption = {
  buyOrderLimit: number;
  ordersToAheadMap: Map<BuyOrder, number>;
};

const makeOrders = (options: MakeOrdersOption) => {
  const { buyOrderLimit, ordersToAheadMap } = options;
  const orderLines = [...ordersToAheadMap.entries()].map(
    ([order, countAhead]) => `${order.amountLeft} ${order.item} \
at ${order.maxPrice} gold or less (Est. ${countAhead} ahead of \
you in buy order queue)`,
  );
  return `Active Buy Orders (${orderLines.length}/${buyOrderLimit}):
${orderLines.join('\n')}`;
};

export { makeOrders };
