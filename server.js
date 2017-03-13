const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const morgan = require('morgan');
const queryParser = require('express-query-int');


//set up express middleware
server.use(morgan('dev', { immediate: false }));
server.use(bodyParser.json());
server.use(queryParser({ parser: parseFloat }));

require('./middleware/extract-params.js')(server)
require('./router')(server);


//Start server
const SERVER_PORT = 8081;
server.listen(SERVER_PORT, function () {
    console.log(`Server listen on Port ${SERVER_PORT}`);
});