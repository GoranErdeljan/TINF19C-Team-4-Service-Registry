FROM node:12
WORKDIR /app
COPY . .

WORKDIR /app/MOD_21_Web-Interface
RUN npm install
WORKDIR /app/MOD_22_Announce_Service_via_DNS-SD
RUN npm install
WORKDIR /app/MOD_23_Register-itself-at-the-OI4-Service-Registry
RUN npm install
WORKDIR /app/MOD_24_DNS-SD-listener
RUN npm install
WORKDIR /app
EXPOSE 8080
ENTRYPOINT ["node", "main.js"]