const request = require('supertest');
// Implementation hasn't been created yet, so we don't have an app to import.
// This test is designed to fail as per TDD requirements.

describe('Form Service Health', () => {
    it('should return 200 OK', async () => {
        // Failing because app is not defined
        const app = require('../src/index');
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
    });
});
