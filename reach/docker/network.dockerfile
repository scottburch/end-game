FROM node:19

RUN apt-get update
RUN apt-get install xsel net-tools

COPY . reach
WORKDIR reach
RUN yarn

ENTRYPOINT yarn testnet


