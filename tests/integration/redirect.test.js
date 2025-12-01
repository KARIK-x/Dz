/**
 * Integration Test - Redirect Route
 * Tests the /r/:token endpoint with valid and invalid tokens
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../server');
const Activation = require('../models/Activation.model');
const User = require('../models/User.model');
const ClickLog = require('../models/ClickLog.model');
const config = require('../config');

describe('Redirect Route Integration Tests', () => {
    let testUser;
    let testActivation;
    let validToken;

    beforeAll(async () => {
        // Connect to test database
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/daraz_cashback_test', {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        }
    });

    beforeEach(async () => {
        // Clear test data
        await User.deleteMany({});
        await Activation.deleteMany({});
        await ClickLog.deleteMany({});

        // Create test user
        testUser = await User.create({
            hashedUserId: 'test_user_hash_123'
        });

        // Create test activation
        testActivation = await Activation.create({
            userId: testUser._id,
            hashedUserId: testUser.hashedUserId,
            productId: 'test_product_12345',
            productTitle: 'Test Product',
            productPrice: 1500,
            hmacSignature: 'test_hmac',
            ipAddress: '127.0.0.1'
        });

        // Generate valid redirect token
        validToken = jwt.sign(
            {
                type: 'redirect',
                activationId: testActivation._id.toString(),
                productId: testActivation.productId
            },
            config.JWT_SECRET,
            { expiresIn: '5m' }
        );

        // Store token in activation
        testActivation.redirectToken = validToken;
        await testActivation.save();
    });

    afterAll(async () => {
        // Clean up and close connection
        await User.deleteMany({});
        await Activation.deleteMany({});
        await ClickLog.deleteMany({});
        await mongoose.connection.close();
    });

    test('GET /r/:token - should redirect with valid token', async () => {
        const response = await request(app)
            .get(`/r/${validToken}`)
            .expect(302);

        // Check redirect location contains affiliate parameters
        expect(response.headers.location).toBeDefined();
        expect(response.headers.location).toContain('aff_code=');
        expect(response.headers.location).toContain(`aff_trace=${testActivation._id}`);
        expect(response.headers.location).toContain('aff_source=daraz_cashback_ext');

        // Verify no spaces in query parameters
        expect(response.headers.location).not.toMatch(/aff_code\s*=\s*/);
        expect(response.headers.location).not.toMatch(/\s+aff_/);

        // Wait for async click log
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify click log was created
        const clickLog = await ClickLog.findOne({ activationId: testActivation._id });
        expect(clickLog).toBeDefined();
        expect(clickLog.ipAddress).toBeDefined();
    });

    test('GET /r/:token - should return 401 with invalid token', async () => {
        const invalidToken = 'invalid_token_string';

        const response = await request(app)
            .get(`/r/${invalidToken}`)
            .expect(401);

        expect(response.text).toContain('Invalid or expired redirect token');
    });

    test('GET /r/:token - should return 401 with expired token', async () => {
        // Generate expired token
        const expiredToken = jwt.sign(
            {
                type: 'redirect',
                activationId: testActivation._id.toString(),
                productId: testActivation.productId
            },
            config.JWT_SECRET,
            { expiresIn: '-1s' } // Expired 1 second ago
        );

        const response = await request(app)
            .get(`/r/${expiredToken}`)
            .expect(401);

        expect(response.text).toContain('Invalid or expired redirect token');
    });

    test('GET /r/:token - should return 404 when activation not found', async () => {
        // Generate token with non-existent activation ID
        const fakeId = new mongoose.Types.ObjectId();
        const tokenWithFakeId = jwt.sign(
            {
                type: 'redirect',
                activationId: fakeId.toString(),
                productId: 'fake_product'
            },
            config.JWT_SECRET,
            { expiresIn: '5m' }
        );

        const response = await request(app)
            .get(`/r/${tokenWithFakeId}`)
            .expect(404);

        expect(response.text).toContain('Activation not found');
    });

    test('GET /r/:token - should return 401 when token mismatches', async () => {
        // Generate different token
        const differentToken = jwt.sign(
            {
                type: 'redirect',
                activationId: testActivation._id.toString(),
                productId: testActivation.productId
            },
            config.JWT_SECRET,
            { expiresIn: '5m' }
        );

        // Don't update activation.redirectToken (mismatch)

        const response = await request(app)
            .get(`/r/${differentToken}`)
            .expect(401);

        expect(response.text).toContain('Token mismatch');
    });

    test('GET /r/:token - should handle X-Forwarded-For header correctly', async () => {
        const response = await request(app)
            .get(`/r/${validToken}`)
            .set('X-Forwarded-For', '203.0.113.1, 198.51.100.1')
            .expect(302);

        // Wait for async click log
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify IP was extracted correctly (first IP in chain)
        const clickLog = await ClickLog.findOne({ activationId: testActivation._id });
        expect(clickLog).toBeDefined();
        expect(clickLog.ipAddress).toBe('203.0.113.1');
    });

    test('GET /r/:token - URL should not contain spaces', async () => {
        const response = await request(app)
            .get(`/r/${validToken}`)
            .expect(302);

        const location = response.headers.location;

        // Verify no spaces in URL
        expect(location).not.toMatch(/\s/);

        // Verify proper query string format
        expect(location).toMatch(/\?[^?]+$/); // Has query string
        expect(location).toMatch(/aff_code=[^&\s]+/);
        expect(location).toMatch(/aff_trace=[^&\s]+/);
    });
});
