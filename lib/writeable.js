'use strict';

const { Subscriber } = require('rxjs/Rx');

class RxWriteable extends Subscriber {
    constructor(writeable) {

        super(
            (chunk) => {
                this._write(chunk);
            },
            (error) => {
                this.raw.emit('error', error);
            },
            () => {
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
