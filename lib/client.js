'use strict';

const Http = require('http');
const Https = require('https');
const { Observable } = require('rxjs/Rx');
const RxWriteable = require('./writeable');
const RxReadable = require('./readable');

class RxObservableClient extends Observable {
    constructor(request) {

        super(
            (observer) => {
                const onResponse = (response) => {
                    observer.next(new RxReadable(response));
                    observer.complete();
                };

                const onError = (error) => {
                    observer.error(error);
                }

                request.on('response', onResponse);
                request.on('error', onError);

                request.end();

                return () => {
                    request.removeListener('response', onResponse);
                    request.removeListener('error', onError);
                };
            }
        );

        this._subject = new RxWriteable(request);
        this._raw = request;
    }

    get subject() {
        return this._subject;
    }

    get raw() {
        return this._raw;
    }
}

class RxHttpClient extends RxObservableClient {
    constructor(options = {}) {
        super(Http.request(options));
    }
}

class RxHttpsClient extends RxHttpClient {
    constructor(options = {}) {
        super(Https.request(options));
    }
}

module.exports = { RxHttpClient, RxHttpsClient };
