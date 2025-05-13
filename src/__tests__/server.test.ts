import { request } from 'http';

test('hello world!', done => {
  request('http://localhost:3000', res => {
    expect(res.statusCode).toBe(200);
    done();
  }).end();
});