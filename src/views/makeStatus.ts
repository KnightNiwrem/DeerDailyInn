import humanizeDuration from 'humanize-duration';
import { isEmpty } from 'lodash';
import { DateTime, Duration } from 'luxon';

import type { Status } from 'models/Status';

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
  const activeStatusText = activeStatuses.map(
    status => `${status.title} (${status.description}, Expiring in: \
${toHumanDifference(Duration.fromISO(status.expireAt), nowDuration)})`
  ).join('\n');

  const expiredStatusText = isEmpty(expiredStatuses)
    ? ''
    : `
Expired Statuses:
${expiredStatuses.map(
  status => `${status.title} (${status.description}, Expired on: \
${DateTime.fromISO(status.expireAt).toFormat('FF')})`
).join('\n')}`;

  const queuedStatusText = isEmpty(queuedStatuses)
    ? ''
    : `
Queue Statuses:
${queuedStatuses.map(
  status => `${status.title} (${status.description}, Starting in: \
${toHumanDifference(Duration.fromISO(status.startAt), nowDuration)})`
).join('\n')}`;

  return `Active Statuses:
${isEmpty(activeStatuses) ? 'None' : activeStatusText}\
${isEmpty(queuedStatuses) ? '' : queuedStatusText}\
${isEmpty(expiredStatuses) ? '' : expiredStatusText}`;
};

export { makeStatus };
