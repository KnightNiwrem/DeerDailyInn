import { isFinite, range } from 'lodash';

const buildHearsRegex = (command: string, maxArity: number) => {
  const regexParts = [
    `^\\/${command}`,
    ...range(isFinite(maxArity) ? maxArity : 1).map(_ => '(?:[_ ](.+?))?'),
    isFinite(maxArity) ? '(?:[_ ].*)?$' : '$',
  ];
  const regex = new RegExp(regexParts.join(''));
  return regex;
};

export { buildHearsRegex };
