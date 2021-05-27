import humanizeDuration from 'humanize-duration';
import { isEmpty } from 'lodash';
import { DateTime, Duration } from 'luxon';

import type { Status } from 'models/mod';

type MakeStatusOptions = {
  activeStatuses: Status[];
  expiredStatuses: Status[];
  queuedStatuses: Status[];
  nowISO: string;
};

const toHumanDifference = (end: Duration, start: Duration) => {
  const difference = end.minus(start).as('milliseconds');
  const humanDifference = humanizeDuration(
    difference,
    { units: ['y', 'mo', 'w', 'd', 'h', 'm', 's'] },
  );
  return humanDifference;
};

const makeStatus = (options: MakeStatusOptions) => {
  const { activeStatuses, expiredStatuses, queuedStatuses, nowISO } = options;
  const nowDuration = Duration.fromISO(nowISO);

  const activeStatusText = activeStatuses.map(status => {
    const { description, title } = status;
    const expireAsDuration = Duration.fromISO(status.expireAt);
    const humanDifference = toHumanDifference(expireAsDuration, nowDuration);
    return `${title} (${description}, Expiring in: ${humanDifference})`;
  }).join('\n');
  const expiredStatusText = expiredStatuses.map(status => {
    const { description, title } = status;
    const expiredDateTime = DateTime.fromISO(status.expireAt).toFormat('FF');
    return `${title} (${description}, Expired on: ${expiredDateTime})`;
  }).join('\n');
  const queuedStatusText = queuedStatuses.map(status => {
    const { description, title } = status;
    const startAsDuration = Duration.fromISO(status.startAt);
    const humanDifference = toHumanDifference(startAsDuration, nowDuration);
    return `${title} (${description}, Starting in: ${humanDifference})`;
  }).join('\n');

  return `Active Statuses:
${isEmpty(activeStatuses) ? 'None' : activeStatusText}

Queued Statuses:
${isEmpty(queuedStatuses) ? 'None' : queuedStatusText}

Expired Statuses:
${isEmpty(expiredStatuses) ? 'None' : expiredStatusText}`;
};

export { makeStatus };
