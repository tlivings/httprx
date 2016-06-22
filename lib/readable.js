'use strict';

const { Observable } = require('rxjs/Rx');

class RxReadable extends Observable {
    constructor(readable) {
        super((observer) => {
            const onReadable = () => {
                let chunk;

                while ((chunk = readable.read()) !== null) {
                    observer.next(chunk);
                }
            };

            const onEnd = () => {
                observer.complete();
            };

            const onError = (error) => {
                observer.error(error);
            };

            readable.on('readable', onReadable);
            readable.on('error', onError);
            readable.on('end', onEnd);

            return () => {
                readable.removeListener('readable', onReadable);
                readable.removeListener('end', onEnd);
                readable.removeListener('error', onError);
            };
        });

        this._raw = readable;
    }

    get raw() {
        return this._raw;
    }
}

module.exports = RxReadable;
