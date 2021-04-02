
FROM node:15
WORKDIR "/app"
COPY package*.json ./
COPY . /app
EXPOSE 3200
USER node
ENTRYPOINT ["bash", "-c"]
CMD ["npm install --production && sleep 10 && npm start"]
