import { each } from 'lodash-es';
import * as net from 'net';
import repl from 'repl';

const buildCreateREPLServer = (context = {}) => (socket: net.Socket) => {
  const prompt = 'REPL> ';
  const replServer = repl.start({
    breakEvalOnSigint: true,
    input: socket,
    output: socket,
    replMode: repl.REPL_MODE_STRICT,
    terminal: true,
    useGlobal: false,
    prompt,
  });
  replServer.on('exit', () => socket.end());
  each(context, (value: any, key: string) => {
    replServer.context[key] = value;
  });
};

const startREPLServer = (port: number, context = {}) => {
  const createREPLServer = buildCreateREPLServer(context);
  net.createServer(createREPLServer).listen(port);
};

export { startREPLServer };
