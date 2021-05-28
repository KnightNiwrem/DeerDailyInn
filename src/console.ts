import { isSafeInteger } from 'lodash-es';
import { connect } from 'net';
import { env } from 'services/env.js';

const consolePort = Number(env.CONSOLE_PORT);
if (!isSafeInteger(consolePort)) {
  throw new Error('A valid CONSOLE_PORT is required.');
}

const sock = connect(consolePort);
const onClose = () => {
  process.stdin.setRawMode(false);
  process.stdin.pause();
};
const onConnect = () => {
  process.stdin.resume();
  process.stdin.setRawMode(true);
};
const onData = (b: Buffer) => {
  if (b.length === 1 && b[0] === 4) {
    process.stdin.emit('end');
  }
};
const onEnd = () => {
  sock.destroy();
  console.log('Console REPL socket ended');
};

sock.on('close', () => {
  onClose();
  sock.removeListener('close', onClose);
});
sock.on('connect', onConnect);
sock.on('data', onData);
sock.on('end', onEnd);

process.stdin.pipe(sock);
sock.pipe(process.stdout);
