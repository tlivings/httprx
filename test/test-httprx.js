'use strict';

const Test = require('tape');
const Http = require('http');
const { RxHttpServer, RxHttpClient } = require('../index');

Test('test httprx', (t) => {

    t.test('get', (t) => {
        const server = new RxHttpServer({ port: 3000 });

        server.subscribe(
            ({ request, response }) => {
                response.next('success');
                response.complete();
            },
            (error) => {
                console.error(error.stack);
            },
            () => {
                t.end();
            }
        );

        new RxHttpClient({method: 'GET', hostname: 'localhost', port: 3000}).flatMap(
            (response) => {
                t.equal(response.raw.statusCode, 200, 'OK status.');
                return response.toArray();
            }
        ).subscribe(
            (data) => {
                t.equal(Buffer.concat(data).toString(), 'success', 'body written.');
            },
            (error) => {
                console.log(error.stack);
            },
            () => {
                server.raw.close();
            }
        );
    });

    t.test('post', (t) => {
        const server = new RxHttpServer({ port: 3000 });

        server.flatMap(
            ({ request, response }) => {
                return request.toArray().map((body) => {
                    request.payload = Buffer.concat(body);
                    return {request, response};
                });
            }
        ).subscribe(
            ({ request, response }) => {
                response.next(request.payload);
                response.complete();
            },
            (error) => {
                console.error(error.stack);
            },
            () => {
                t.end();
            }
        );

        const client = new RxHttpClient({method: 'POST', hostname: 'localhost', port: 3000});

        client.subject.next('test');
        client.subject.complete();

        client.flatMap(
            (response) => {
                t.equal(response.raw.statusCode, 200, 'OK status.');
                return response.toArray();
            }
        ).subscribe(
            (data) => {
                t.equal(Buffer.concat(data).toString(), 'test', 'body written.');
            },
            (error) => {
                console.log(error.stack);
            },
            () => {
                server.raw.close();
            }
        );
    });

});
