# ctfjs
[![npm](https://img.shields.io/npm/v/ctfjs.svg)](https://www.npmjs.com/package/ctfjs)
[![Build Status](https://travis-ci.org/blairsec/ctfjs.svg?branch=master)](https://travis-ci.org/blairsec/ctfjs)
ctfjs is a CTF (capture the flag) competition backend written in Node.js.

It is still in development, and is not ready to be used to host an actual CTF.

## Documentation
Documentation is available at [https://blairsec.github.io/ctfjs/](https://blairsec.github.io/ctfjs/).

## Installation
ctfjs can be installed as either a command or a node module.

### Command
If all you need is a simple backend for challenges, users, and teams, this is probably what you should choose.
To install ctfjs as a terminal command, run:
```
npm install -g ctfjs
```

### Node Module
This option will require more setup and configuration.
To install ctfjs as a node module in your current directory, run:
```
npm install ctfjs
```

You will also need express to create the web server:
```
npm install express
```

## Deployment
Remember that this is just a REST API and requires a front end to go with it. You will also need to have PostgreSQL running
somewhere. Deployment will depend on whether you installed ctfjs as a command or as a module.

### Command
If you installed ctfjs as a command, deployment is simple. To start ctfjs, run:
```h
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
postgresql://username:password@host:port/database
```

### Node Module
If you installed ctfjs as a node module, you will need another file that imports ctfjs and starts a new server.
For example:
```javascript
var express = require('express')
var app = express()

var CTF = require('ctfjs')
var ctf = new CTF({
  db_uri: 'postgresql://localhost/ctfjs',
  jwt_secret: 'secret key here'
})

app.use(ctf.router)
app.listen(3000)
```