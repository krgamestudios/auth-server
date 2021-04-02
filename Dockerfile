
FROM node:15
WORKDIR "/app"
COPY package*.json ./
COPY . /app
RUN "npm install --production"
EXPOSE 3200
USER node
ENTRYPOINT ["bash", "-c"]
CMD ["sleep 10 && npm start"]
