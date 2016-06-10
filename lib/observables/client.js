
const Http = require('http');
const Https = require('https');
const { Observable, Subscriber} = require('rxjs/Rx');
const Debuglog = require('util').debuglog;
const RxWriteable = require('./writeable');
const RxReadable = require('./readable');

class RxObservableClient extends Observable {
    constructor(request) {
        const log = Debuglog('httprx/client');

        super(
            (observer) => {
                const onResponse = (response) => {
                    log(`response (status=${response.statusCode}).`);
                    observer.next(new RxReadable(response));
                    observer.complete();
                };

                const onError = (error) => {
                    log(`error (message=${error.message}).`);
                    observer.error(error);
                }

                request.once('response', onResponse);
                request.on('error', onError);

                request.end();

                return () => {
                    log('dispose.');
                    request.removeListener('response', onResponse);
                    request.removeListener('error', onError);
                };
            }
        );

        this.subject = new RxWriteable(request);
        this.raw = request;
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
