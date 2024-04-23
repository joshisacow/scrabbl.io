# esbuild build
FROM library/node:18-alpine as esbuild
WORKDIR /home/node/app
COPY package*.json ./
COPY *.js* ./
COPY *.ts* ./
COPY game-logic ./game-logic
COPY schema.graphql ./
RUN npm i
RUN ls -al && npm run build

# node
FROM library/node:18-alpine as node
COPY --from=esbuild /home/node/app/dist/ /home/node/app/dist/
COPY --from=esbuild /home/node/app/game-logic/legalWords.txt /home/node/app/dist
COPY --from=esbuild /home/node/app/schema.graphql /home/node/app/
WORKDIR /home/node/app
ENTRYPOINT [ "node", "dist/server.js" ]
EXPOSE 8171