// Main starting point of the app
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const router = require('./router');
const mongoose = require('mongoose');
const cors = require('cors');

// DB SetUp
mongoose.connect('mongodb://localhost:auth/auth');

// Create our app - an instance of express
const app = express();

// App SetUp
app.use(morgan('combined'));
app.use(cors())
app.use(bodyParser.json({ type: '*/*'}));
router(app);

// Server SetUp
const port = process.env.PORT || 3090;
// Creat an http server - app will be used to handle all traffic in this server
const server = http.createServer(app);
server.listen(port);
console.log('Server is running and listenning on port: ', port);
