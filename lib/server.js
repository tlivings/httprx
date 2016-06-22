'use strict';

const Http = require('http');
const Https = require('https');
const { Observable } = require('rxjs/Rx');
const RxReadable = require('./readable');
const RxWriteable = require('./writeable');
const Entries = require('entries');

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

        this.status = 200;
        this.headers = {};
    }

    _sendHeaders() {
        if (!this._raw.headersSent) {
            for (const [name, value] of Entries(this.headers)) {
                this._raw.setHeader(name, value);
            }
        }
    }

    _write(chunk) {
        try {
            this._sendHeaders();
        }
        catch (error) {
            this._error(error);
            return;
        }
        super._write(chunk);
    }

    _end() {
        try {
            this._sendHeaders();
        }
        catch (error) {
            this._error(error);
            return;
        }

        this._raw.statusCode = this.status;

        super._end();
    }

    _error(error) {
        console.error(error.stack);
        this._raw.statusCode = 500;
        super._end();
    }
}

module.exports = {
    RxHttpServer,
    RxHttpsServer,
    RxResponse
};
