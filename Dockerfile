FROM node:16-buster-slim

WORKDIR /ddi/migrations
COPY migrations .

WORKDIR /ddi/src
COPY src .

WORKDIR /ddi
COPY package.json .
COPY tsconfig.json .
COPY yarn.lock .
RUN yarn && \
    yarn lint && \
    yarn tsc

CMD ["docker:start"]
ENTRYPOINT ["yarn"]
