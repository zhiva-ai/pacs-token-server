FROM node:18-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install

# Bundle app source
COPY . /usr/src/app/
RUN npm run build

CMD ["npm", "start"]