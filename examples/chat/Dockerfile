FROM node:18

RUN apt-get update
RUN apt-get install xsel net-tools

COPY examples/chat examples/chat
WORKDIR examples/chat
RUN yarn
RUN yarn build

ENTRYPOINT yarn serve


