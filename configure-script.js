//setup
const readline = require('readline');
const fs = require('fs');
const crypto = require("crypto");

const uuid = (bytes = 16) => crypto.randomBytes(bytes).toString("hex");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

//manually promisify this (util didn't work)
const question = (prompt, def = null) => {
	return new Promise((resolve, reject) => {
		rl.question(`${prompt}${def ? ` (${def})` : ''}: `, answer => {
			//loop on required
			if (def === null && !answer) {
				return resolve(question(prompt, def));
			}

			return resolve(answer || def);
		});
	});
};

//questions
(async () => {
	//project configuration
	const appName = await question('App Name', 'auth');
	const appWebAddress = await question('Web Addr', `${appName}.example.com`);
	const appPort = await question('App Port', '3200');

	const appDBUser = await question('DB User', appName);
	const appDBPass = await question('DB Pass', uuid());
	const dbRootPass = await question('DB Root Pass');

	const appMailSMTP = await question('Mail SMTP', 'smtp.example.com');
	const appMailUser = await question('Mail User', 'example@example.com');
	const appMailPass = await question('Mail Pass');
	const appMailPhysical = await question('Mail Physical');

	const appDefaultUser = await question('App Default User', '');
	const appDefaultPass = await question('App Default Pass', '');

	const appSecretAccess = await question('Access Token Secret', uuid(32));
	const appSecretRefresh = await question('Refresh Token Secret', uuid(32));

	const supportEmail = await question('Support Email', appMailUser);

	//generate the files
	const ymlfile = `
version: '3'

services:
  ${appName}:
    build:
      context: .
    ports:
      - "${appPort}"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.${appName}router.rule=Host(\`${appWebAddress}\`)"
      - "traefik.http.routers.${appName}router.entrypoints=websecure"
      - "traefik.http.routers.${appName}router.tls.certresolver=myresolver"
      - "traefik.http.routers.${appName}router.service=${appName}service@docker"
      - "traefik.http.services.${appName}service.loadbalancer.server.port=${appPort}"
    environment:
      - WEB_PROTOCOL=https
      - WEB_ADDRESS=${appWebAddress}
      - WEB_PORT=${appPort}
      - DB_HOSTNAME=database
      - DB_DATABASE=${appName}
      - DB_USERNAME=${appDBUser}
      - DB_PASSWORD=${appDBPass}
      - DB_TIMEZONE=Australia/Sydney
      - MAIL_SMTP=${appMailSMTP}
      - MAIL_USERNAME=${appMailUser}
      - MAIL_PASSWORD=${appMailPass}
      - MAIL_PHYSICAL=${appMailPhysical}
      - ADMIN_DEFAULT_USERNAME=${appDefaultUser}
      - ADMIN_DEFAULT_PASSWORD=${appDefaultPass}
      - SECRET_ACCESS=${appSecretAccess}
      - SECRET_REFRESH=${appSecretRefresh}
    networks: 
      - app-network
    depends_on:
      - database
  database:
    image: mariadb:latest
    environment:
      MYSQL_DATABASE: ${appName}
      MYSQL_USER: ${appDBUser}
      MYSQL_PASSWORD: ${appDBPass}
      MYSQL_ROOT_PASSWORD: ${dbRootPass}
    networks: 
      - app-network
    volumes:
      - ./mysql:/var/lib/mysql
      - ./startup.sql:/docker-entrypoint-initdb.d/startup.sql:ro
  traefik_${appName}:
    container_name: ${appName}_traefik
    image: "traefik:v2.4"
    container_name: "traefik"
    command:
      - "--log.level=ERROR"
      - "--api.insecure=false"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=${supportEmail}"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "./letsencrypt:/letsencrypt"
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
    networks:
      - app-network
networks:
  app-network:
    driver: bridge
`;

const dockerfile = `
FROM node:15
WORKDIR "/app"
COPY package*.json ./
COPY . /app
RUN npm install --production
EXPOSE ${appPort}
USER node
ENTRYPOINT ["bash", "-c"]
CMD ["sleep 10 && npm start"]
`;

	const sqlfile = `
CREATE DATABASE IF NOT EXISTS ${appName};
CREATE USER IF NOT EXISTS '${appDBUser}'@'%' IDENTIFIED BY '${appDBPass}';
GRANT ALL PRIVILEGES ON ${appName}.* TO '${appDBUser}'@'%';
`;

	fs.writeFileSync('docker-compose.yml', ymlfile);
	fs.writeFileSync('Dockerfile', dockerfile);
	fs.writeFileSync('startup.sql', sqlfile);
})()
	.then(() => rl.close())
	.catch(e => console.error(e))
;
