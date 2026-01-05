const request = require('supertest');

describe('Management Service Health', () => {
    it('should return 200 OK', async () => {
        // Failing because app is not defined/exported correctly yet
        const app = require('../src/index');
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
    });
});
