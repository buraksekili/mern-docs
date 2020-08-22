# mern-docs
Online document storage with MERN stack.

https://bs-docs-clone.herokuapp.com/

## Setting up the local environment

Backend(node.js) and client side(react) must be run concurrently. 

Run the following command in project folder where Node.js' package.json file is located.
```
  npm install
  npm run server
```

In the /client folder, run
```
  npm install
  npm run start
```

npm install will load /node_modules.

Also, .env file must be created in project folder with following environment variables;
```
  JWT_SECRET
  mongoURI
```
