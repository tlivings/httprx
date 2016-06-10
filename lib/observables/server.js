'use strict';

const Http = require('http');
const Https = require('https');
const { Observable } = require('rxjs/Rx');
const Debuglog = require('util').debuglog;
const RxReadable = require('./readable');
const RxWriteable = require('./writeable');

class RxObservableServer extends Observable {
    constructor(server, on) {
        const log = Debuglog('httprx/server');

        super((observer) => {
            const onRequest = (request, response) => {
                log(`request (url=${request.url}).`);
                observer.next({ request: new RxReadable(request), response: new RxResponse(response) });
            };

            const onClose = () => {
                log('closed.');
                observer.complete();
            };

            const onError = (error) => {
                log(`error (message=${error.message}).`);
                observer.error(error);
            };

            server.listen(on, () => {
                observer.next(server);

                server.on('request', onRequest);
                server.on('close', onClose);
                server.on('error', onError);
            });

            return () => {
                log('disposed.');
                server.removeListener('request', onRequest);
                server.removeListener('close', onClose);
                server.removeListener('error', onError);
            }
        });

        this.raw = server;
    }
}

class RxHttpServer extends RxObservableServer {
    constructor({ port }) {
        super(Http.createServer(), port);
    }
}

class RxHttpsServer extends RxObservableServer {
    constructor(options = {}) {
        super(Https.createServer(options), options.port);
    }
}

class RxResponse extends RxWriteable {
    constructor(response) {
        const log = Debuglog('rx/serverResponse');

        super(response);

        this.status = undefined;
        this.headers = {};
        this.log = log;
    }

    _sendHeaders() {
        if (!this.raw.headersSent) {
            const status = this.status || 200;

            this.log(`write head (status=${status}).`);

            this.raw.writeHead(status, this.headers);
        }
    }

    _write(chunk) {
        this._sendHeaders();
        super._write(chunk);
    }

    _end() {
        this._sendHeaders();
        super._end();
    }
}

module.exports = {
    RxHttpServer,
    RxHttpsServer,
    RxResponse
};
