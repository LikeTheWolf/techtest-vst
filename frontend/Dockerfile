FROM node:22-alpine

# Set working directory
WORKDIR /clock

# Copy package files
# Copy exact dependency graph
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the files
COPY . .

# Build the React app
RUN npm run build

# Expose port 4002
EXPOSE 4003

# Serve the app with http-server
CMD ["npx", "http-server", "./build", "-p", "4003", "--ssl", "--cert", "/clock/ssl/cloudflare-origin.pem", "--key", "/clock/ssl/cloudflare-origin.key"]
