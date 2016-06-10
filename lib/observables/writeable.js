'use strict';

const { Subscriber } = require('rxjs/Rx');
const Debuglog = require('util').debuglog;

class RxWriteable extends Subscriber {
    constructor(writeable) {
        const log = Debuglog('httprx/writeable');

        super(
            (chunk) => {
                log(`write (length=${chunk ? chunk.length : 0}).`);
                this._write(chunk);
            },
            (error) => {
                log(`error (message=${error.message}).`);
                this.raw.emit('error', error);
            },
            () => {
                log('end.');
                this._end();
            }
        );

        this.raw = writeable;
    }

    _write(chunk) {
        this.raw.write(chunk);
    }

    _end() {
        this.raw.end();
    }
}

module.exports = RxWriteable;
