# Use official Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy only package.json and package-lock.json first for efficient caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app
COPY . .

# Expose the port (should match your app's port)
EXPOSE 5000

