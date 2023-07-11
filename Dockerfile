# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json to the container
COPY . .

# Install dependencies
RUN npm install

# Build the Next.js app
RUN npm run build

# Set the environment variable for running the app
ENV NODE_ENV=production

# Expose port 3000 for the app to listen on
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]
