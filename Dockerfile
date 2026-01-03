FROM node:25-alpine
# Set the working directory inside the container
WORKDIR /app 
# Copy package files inside the app directory
COPY package*.json ./ 

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
    then npm install; \
    else npm install --only=production; \
    fi

COPY . ./
# Docker container can talk to the outside world but the outside world cannot talk to the container directly 
# Expose port 3000 to the outside world
ENV PORT 3000
EXPOSE $PORT
CMD ["node", "index.js"]

# docker build . -t my-node-app
# To run the container and map port 3000 of the container to port 2000 on the host machine
# docker run -p 2000:3000 my-node-app 
# -v $(pwd):/app  --> to mount current directory to /app in the container. Creates a volume that syncs files between host and container
# -v /app/node_modules  --> to prevent overwriting node_modules in the container with an empty folder from the host
# Read only bind mount: -v $(pwd):/app:ro --> to prevent changes to the host files from inside the container
# --env VAR_NAME=value  --> to set environment variables in the container
# --env-file ./env --> to load environment variables from a file