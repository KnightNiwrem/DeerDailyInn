FROM knightniwrem/deno

USER deno
ENV DENO_DIR=.deno
WORKDIR /home/deno/ddi/.deno

WORKDIR /home/deno/ddi/migrations
COPY migrations .

WORKDIR /home/deno/ddi/src
COPY src .

WORKDIR /home/deno/ddi
COPY import_map.json .
COPY knexfile.js .
RUN deno cache --import-map=import_map.json src/mod.ts

CMD ["run", "--import-map=import_map.json", "--allow-env", "--allow-read", "--cached-only", "src/mod.ts"]
ENTRYPOINT ["deno"]
