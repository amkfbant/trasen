FROM node:20-alpine

WORKDIR /usr/src/app
COPY api/package*.json ./
RUN npm install

COPY api/index.js ./
COPY api/app.js ./
COPY api/server.js ./
COPY api/database.js ./
COPY api/controllers ./controllers
COPY api/services ./services
EXPOSE 3000
CMD ["npm", "run", "start"]
