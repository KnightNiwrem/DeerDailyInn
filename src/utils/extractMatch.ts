import { isNil } from 'lodash';

const extractMatch = (
  ctxMatch: string | RegExpMatchArray | null | undefined,
) => {
  if (isNil(ctxMatch)) {
    return [];
  }
  if (typeof ctxMatch === 'string') {
    return [ctxMatch];
  }
  return [...ctxMatch].slice(1);
};

export { extractMatch };
