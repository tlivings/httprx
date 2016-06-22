'use strict';

const { Subscriber } = require('rxjs/Rx');

class RxWriteable extends Subscriber {
    constructor(writeable) {

        super(
            (chunk) => {
                this._write(chunk);
            },
            (error) => {
                this._raw.emit('error', error);
            },
            () => {
                this._end();
            }
        );

        this._raw = writeable;
    }

    get raw() {
        return this._raw;
    }

    _write(chunk) {
        this._raw.write(chunk);
    }

    _end() {
        this._raw.end();
    }
}

module.exports = RxWriteable;
