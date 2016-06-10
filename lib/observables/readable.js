
const { Observable } = require('rxjs/Rx');
const Debuglog = require('util').debuglog;

class RxReadable extends Observable {
    constructor(readable) {
        const log = Debuglog('httprx/readable');

        super((observer) => {
            const onReadable = () => {
                let chunk;

                log('readable.');

                while ((chunk = readable.read()) !== null) {
                    observer.next(chunk);
                }
            };

            const onEnd = () => {
                log('end.');
                observer.complete();
            };

            const onError = (error) => {
                log(`error (message=${error.message}).`);
                observer.error(error);
            };

            readable.on('readable', onReadable);
            readable.once('error', onError);
            readable.once('end', onEnd);

            return () => {
                log('disposed.');
                readable.removeListener('readable', onReadable);
                readable.removeListener('end', onEnd);
                readable.removeListener('error', onError);
            };
        });

        this.raw = readable;
    }
}

module.exports = RxReadable;
