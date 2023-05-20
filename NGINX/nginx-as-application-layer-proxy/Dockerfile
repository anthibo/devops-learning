FROM node:12
RUN apt-get install -y curl
WORKDIR /usr/app
COPY app /usr/app
RUN npm install
CMD node index.js
EXPOSE 9999