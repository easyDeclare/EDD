# Use an official Node image as a parent image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the frontend source code into the container
COPY . .

# Define the command to run your frontend application
CMD ["npm", "start"]
