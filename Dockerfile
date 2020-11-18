FROM node:latest

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 8005

CMD [ "npm" , "start" ]