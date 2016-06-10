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
            readable.once('error', onError);
            readable.once('end', onEnd);

            return () => {
                readable.removeListener('readable', onReadable);
                readable.removeListener('end', onEnd);
                readable.removeListener('error', onError);
            };
        });

        this.raw = readable;
    }
}

module.exports = RxReadable;
