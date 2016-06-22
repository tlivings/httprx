'use strict';

const Http = require('http');
const Https = require('https');
const { Observable } = require('rxjs/Rx');
const RxReadable = require('./readable');
const RxWriteable = require('./writeable');

class RxObservableServer extends Observable {
    constructor(server, on) {

        super((observer) => {

            const onRequest = (request, response) => {
                observer.next({ request: new RxReadable(request), response: new RxResponse(response) });
            };

            const onClose = () => {
                observer.complete();
            };

            const onError = (error) => {
                observer.error(error);
            };

            const onListen = () => {
                server.on('request', onRequest);
                server.on('close', onClose);
                server.on('error', onError);
            };

            server.on('listening', onListen);

            server.listen(on);

            return () => {
                server.removeListener('request', onRequest);
                server.removeListener('close', onClose);
                server.removeListener('error', onError);
                server.removeListener('listen', onListen);
            }
        });

        this._raw = server;
    }

    get raw() {
        return this._raw;
    }
}

class RxHttpServer extends RxObservableServer {
    constructor({ port } = {}) {
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
        super(response);

        this.status = undefined;
        this.headers = {};
    }

    _sendHeaders() {
        if (!this._raw.headersSent) {
            const status = this.status || 200;
            this._raw.writeHead(status, this.headers);
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
