
FROM node:22-bookworm-slim
WORKDIR "/app"
COPY package*.json /app
RUN npm install --omit=dev
COPY . /app
EXPOSE 3200
USER node
ENTRYPOINT ["bash", "-c"]
CMD ["sleep 10 && npm start"]
