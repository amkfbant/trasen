FROM node:20-alpine

WORKDIR /usr/src/app
COPY api/package*.json ./
RUN npm install

COPY api/index.js ./
COPY api/database.js ./
EXPOSE 3000
CMD ["npm", "run", "start"]
