FROM node:4.4.4

COPY app/node_modules /app/node_modules
COPY app/bin /app/bin
COPY app/static /app/static
COPY app/hasuraconfig.js /app/hasuraconfig.js
COPY app/package.json /app/package.json
COPY app/runserver.sh /app/runserver.sh
COPY app/.babelrc /app/.babelrc
COPY app/server.babel.js /app/server.babel.js
COPY app/src /app/src

CMD /app/runserver.sh
