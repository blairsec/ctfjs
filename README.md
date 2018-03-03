# ctfjs
ctfjs is a CTF (capture the flag) competition backend written in Node.js.

It is still in development, and is not ready to be used to host an actual CTF yet.

## Documentation
Documentation is available at [https://blairsec.github.io/ctfjs/](https://blairsec.github.io/ctfjs/).

## Setup
Setup is simple and requires only a few steps:
1. Set up a MongoDB server and put the database URI in config.js.
2. Set the secret key in config.js to something secret.

## Deployment
Remember, this is just a REST API and requires a front end to go with it. To run ctfjs, you can simply run:
```
node index.js
```
For production, it is recommended you use something like [pm2](https://github.com/Unitech/pm2) or [forever](https://github.com/foreverjs/forever) to run the application.