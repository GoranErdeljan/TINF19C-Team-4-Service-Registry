# Check out our GitHub: github.com/GoranErdeljan/TINF19C-Team-4-Service-Registry
# This File builds a docker image for the DNS-SD Test-Application from source

# Use the node-image as base
FROM node:12
WORKDIR /app
# Copy code
COPY . .

# Install npm packages for all modules
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