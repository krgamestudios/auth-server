
FROM node:18-bullseye-slim
WORKDIR "/app"
COPY package*.json /app
RUN npm install --production
COPY . /app
EXPOSE 3200
USER node
ENTRYPOINT ["bash", "-c"]
CMD ["sleep 10 && npm start"]
