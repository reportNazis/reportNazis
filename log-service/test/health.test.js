const request = require('supertest');

describe('Log Service Health', () => {
    it('should return 200 OK', async () => {
        // Failing as expected
        const app = require('../src/index');
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
    });
});
