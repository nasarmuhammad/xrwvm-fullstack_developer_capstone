FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY app.js dealership.js review.js ./
COPY data/dealerships.json data/reviews.json ./data/

EXPOSE 3030
CMD ["node", "app.js"]
