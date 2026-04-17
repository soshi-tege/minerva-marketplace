# initialize the image with node 22
FROM node:22

# initiate the app in the root directory
WORKDIR /.

# copy package.json and package-lock.json
COPY package*.json ./

# run `npm install`
RUN npm install

COPY . .

# Run the app after docker image is built
CMD ["npm", "start"]
