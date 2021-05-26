import type { BuyOrder } from 'models/BuyOrder';

type MakeOrdersOption = {
  buyOrderLimit: number;
  ordersToAheadMap: Map<BuyOrder, number>;
}

const makeOrders = (options: MakeOrdersOption) => {
  const { buyOrderLimit, ordersToAheadMap } = options;
  const orderLines = [...ordersToAheadMap.entries()].map(([order, countAhead]) => {
    return `${order.amountLeft} ${order.item} at ${order.maxPrice} \
gold or less (Est. ${countAhead} ahead of you in buy order queue)`;
  });
  return `Active Buy Orders (${orderLines.length}/${buyOrderLimit}):
${orderLines.join('\n')}`;
};

export { makeOrders };
