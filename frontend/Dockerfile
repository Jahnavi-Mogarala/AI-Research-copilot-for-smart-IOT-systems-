FROM node:20-alpine

WORKDIR /app

COPY package.json .
# Install with legacy-peer-deps to ignore react 19 RC dependencies warnings
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
