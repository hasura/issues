FROM node:4.4.4
COPY app /app
CMD node /app/server.js
