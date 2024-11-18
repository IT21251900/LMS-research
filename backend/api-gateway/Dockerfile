# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Set NODE_ENV to 'docker' for containerized environment
ENV NODE_ENV=docker

# Build TypeScript files
RUN npm run build

# Expose the port and run the app
EXPOSE 8080
CMD ["node", "dist/index.js"]
