# Check out our GitHub: github.com/GoranErdeljan/TINF19C-Team-4-Service-Registry
# This File builds a docker image for the DNS-SD-Interface from source

# Use the node-image as base
FROM node:12
WORKDIR /app
# Copy code
COPY . .

# Install npm packages for all modules
WORKDIR /app/MOD_11_DNS-SD-Listener
RUN npm install
WORKDIR /app/MOD_12_OI4-Service-Registry-listener
RUN npm install
WORKDIR /app/MOD_13_OI4-Conformity-Validator
RUN npm install
WORKDIR /app

ENTRYPOINT ["node", "main.js"]