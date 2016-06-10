'use strict';

const Http = require('http');
const { Observable } = require('rxjs/Rx');
const Debuglog = require('util').debuglog;
const RxReadable = require('./readable');
const RxWriteable = require('./writeable');

class RxHttpServer extends Observable {
    constructor(server = Http.createServer(), on = 80) {
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

            server.on('request', onRequest);
            server.on('close', onClose);
            server.on('error', onError);

            server.listen(on);

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

module.exports = RxHttpServer;
module.exports.RxResponse = RxResponse;
