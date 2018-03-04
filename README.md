# ctfjs
[![npm](https://img.shields.io/npm/v/ctfjs.svg)](https://www.npmjs.com/package/ctfjs)

ctfjs is a CTF (capture the flag) competition backend written in Node.js.

It is still in development, and is not ready to be used to host an actual CTF.

## Documentation
Documentation is available at [https://blairsec.github.io/ctfjs/](https://blairsec.github.io/ctfjs/).

## Installation
```
npm install -g ctfjs
```

## Deployment
Remember, this is just a REST API and requires a front end to go with it. To start ctfjs, run:
```
ctfjs start
```

To stop ctfjs, run:
```
ctfjs stop
```

By default ctfjs runs on port 3000 with a randomly generated secret key, and tries to use `localhost` for MongoDB. These 
options can be changed with the arguments `-p` (port), `-s` (secret key), and `-d` (database URI).
For more information run:
```
ctfjs start --help
```
The username and password for the database can be included in the URI with the following format:
```
mongodb://username:password@host:port/database
```