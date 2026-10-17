import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { Location } from '../src/modules/locations/location.model.js';

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/spotly_test';

describe('Location REST API Integration Tests', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await mongoose.connect(TEST_DB_URI);
    app = createApp();
  });

  afterAll(async () => {
    // Drop test database and close connection
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean collection between tests
    await Location.deleteMany({});
  });

  // 1. Create valid location
  it('1. should create a valid location with 201 Created', async () => {
    const payload = {
      name: 'Blue Tokai Coffee Roasters',
      description: 'Specialty cafe serving single-origin brews.',
      category: 'cafe',
      latitude: 30.735,
      longitude: 76.782,
    };

    const res = await request(app).post('/api/locations').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.name).toBe(payload.name);
    expect(res.body.data.category).toBe('cafe');
    expect(res.body.data.latitude).toBe(30.735);
    expect(res.body.data.longitude).toBe(76.782);
  });

  // 2. Reject missing name
  it('2. should reject location creation if name is missing with 400 Bad Request', async () => {
    const payload = {
      description: 'No name provided',
      category: 'park',
      latitude: 30.74,
      longitude: 76.78,
    };

    const res = await request(app).post('/api/locations').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // 3. Reject invalid coordinates
  it('3. should reject invalid coordinates outside valid lat/lng ranges with 400', async () => {
    const invalidLat = {
      name: 'Invalid Latitude Spot',
      description: 'Lat is beyond 90 degrees',
      category: 'landmark',
      latitude: 95.5,
      longitude: 76.78,
    };

    const resLat = await request(app).post('/api/locations').send(invalidLat);
    expect(resLat.status).toBe(400);
    expect(resLat.body.success).toBe(false);

    const invalidLng = {
      name: 'Invalid Longitude Spot',
      description: 'Lng is beyond 180 degrees',
      category: 'landmark',
      latitude: 30.74,
      longitude: -185.2,
    };

    const resLng = await request(app).post('/api/locations').send(invalidLng);
    expect(resLng.status).toBe(400);
    expect(resLng.body.success).toBe(false);
  });

  // 4. Reject invalid category
  it('4. should reject unknown category with 400 Bad Request', async () => {
    const payload = {
      name: 'Invalid Category Spot',
      description: 'Category does not match allowed enum values',
      category: 'amusement_park', // invalid category
      latitude: 30.74,
      longitude: 76.78,
    };

    const res = await request(app).post('/api/locations').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 5. Retrieve all locations
  it('5. should retrieve all locations with 200 OK', async () => {
    await Location.create([
      {
        name: 'Spot Alpha',
        description: 'First location',
        category: 'cafe',
        latitude: 30.71,
        longitude: 76.72,
      },
      {
        name: 'Spot Beta',
        description: 'Second location',
        category: 'park',
        latitude: 30.73,
        longitude: 76.74,
      },
    ]);

    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  // 6. Retrieve location by ID
  it('6. should retrieve a single location by its ID with 200 OK', async () => {
    const created = await Location.create({
      name: 'Rose Heritage Walk',
      description: 'A serene pathway through gardens',
      category: 'park',
      latitude: 30.745,
      longitude: 76.781,
    });

    const res = await request(app).get(`/api/locations/${created._id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Rose Heritage Walk');
    expect(res.body.data._id.toString()).toBe(created._id.toString());
  });

  // 7. Update location
  it('7. should update an existing location via PATCH with 200 OK', async () => {
    const created = await Location.create({
      name: 'Old Plaza Name',
      description: 'Old plaza description',
      category: 'store',
      latitude: 30.72,
      longitude: 76.75,
    });

    const updates = {
      name: 'New Refurbished Plaza',
      description: 'Updated modern description',
    };

    const res = await request(app).patch(`/api/locations/${created._id}`).send(updates);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('New Refurbished Plaza');
    expect(res.body.data.description).toBe('Updated modern description');
    expect(res.body.data.category).toBe('store'); // Preserved untouched fields
  });

  // 8. Delete location
  it('8. should delete an existing location with 200 OK', async () => {
    const created = await Location.create({
      name: 'Temporary Event Spot',
      description: 'To be removed',
      category: 'service',
      latitude: 30.73,
      longitude: 76.76,
    });

    const res = await request(app).delete(`/api/locations/${created._id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('Location deleted successfully');

    // Verify it is removed from database
    const findAttempt = await Location.findById(created._id);
    expect(findAttempt).toBeNull();
  });

  // 9. Search locations by name
  it('9. should search locations by name with case-insensitive substring matching', async () => {
    await Location.create([
      {
        name: 'The French Baker Artisan Cafe',
        description: 'Pastries and baguettes',
        category: 'cafe',
        latitude: 30.71,
        longitude: 76.71,
      },
      {
        name: 'Green Field Cricket Stadium',
        description: 'Sports complex',
        category: 'landmark',
        latitude: 30.72,
        longitude: 76.72,
      },
    ]);

    const res = await request(app).get('/api/locations?search=baker');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('The French Baker Artisan Cafe');
  });

  // 10. Filter locations by category
  it('10. should filter locations accurately by category', async () => {
    await Location.create([
      {
        name: 'Heritage Park',
        description: 'Green zone',
        category: 'park',
        latitude: 30.71,
        longitude: 76.71,
      },
      {
        name: 'Corner Bakery Cafe',
        description: 'Espresso and sandwiches',
        category: 'cafe',
        latitude: 30.72,
        longitude: 76.72,
      },
    ]);

    const res = await request(app).get('/api/locations?category=park');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].category).toBe('park');
  });

  // 11. Return 404 for a nonexistent location
  it('11. should return 404 LOCATION_NOT_FOUND for non-existent valid ObjectId', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/locations/${nonExistentId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('LOCATION_NOT_FOUND');
  });

  // 12. Handle malformed object IDs
  it('12. should handle malformed object IDs and return 400 Bad Request', async () => {
    const malformedId = 'not-a-valid-mongodb-id-123';
    const res = await request(app).get(`/api/locations/${malformedId}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
