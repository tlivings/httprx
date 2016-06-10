'use strict';

const { RxHttpServer, RxHttpsServer } = require('./lib/server');
const { RxHttpClient, RxHttpsClient } = require('./lib/client');

module.exports = {
    RxHttpServer,
    RxHttpsServer,
    RxHttpClient,
    RxHttpsClient
};
