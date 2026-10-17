# REST API Specification — Spotly

Base URL: `/api` (Default local development: `http://localhost:4000/api`)

All responses conform to a unified envelope structure:

```json
{
  "success": true,
  "data": { ... }
}
```

Or on error:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "BAD_REQUEST",
    "details": [
      { "field": "latitude", "message": "Latitude must be between -90 and 90" }
    ]
  }
}
```

---

## 1. Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Returns operational status and database connection health.
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "status": "ok",
      "timestamp": "2026-10-15T10:15:00.000Z",
      "database": "connected"
    }
  }
  ```

---

## 2. List Locations
- **Endpoint**: `GET /api/locations`
- **Query Parameters**:
  - `search` (optional string): Case-insensitive search on location name.
  - `category` (optional string): Filter by category (`cafe`, `park`, `landmark`, `store`, `service`).
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "670f5e13a912a53d9e03f1b4",
        "name": "Sukhna Lake Promenade",
        "description": "Scenic reservoir at the foothills of the Himalayas.",
        "category": "landmark",
        "latitude": 30.7421,
        "longitude": 76.8188,
        "createdAt": "2026-10-15T09:00:00.000Z",
        "updatedAt": "2026-10-15T09:00:00.000Z"
      }
    ]
  }
  ```

---

## 3. Get Location by ID
- **Endpoint**: `GET /api/locations/:id`
- **Parameters**: `id` (Valid 24-char hex MongoDB ObjectId)
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "_id": "670f5e13a912a53d9e03f1b4",
      "name": "Sukhna Lake Promenade",
      "description": "Scenic reservoir at the foothills of the Himalayas.",
      "category": "landmark",
      "latitude": 30.7421,
      "longitude": 76.8188,
      "createdAt": "2026-10-15T09:00:00.000Z",
      "updatedAt": "2026-10-15T09:00:00.000Z"
    }
  }
  ```
- **Error Codes**: `400 BAD_REQUEST` (malformed ID), `404 NOT_FOUND`.

---

## 4. Create Location
- **Endpoint**: `POST /api/locations`
- **Body**:
  ```json
  {
    "name": "Sector 17 Plaza",
    "description": "Iconic pedestrian shopping and cultural precinct.",
    "category": "store",
    "latitude": 30.7415,
    "longitude": 76.7849
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "_id": "670f5e13a912a53d9e03f1b5",
      "name": "Sector 17 Plaza",
      "description": "Iconic pedestrian shopping and cultural precinct.",
      "category": "store",
      "latitude": 30.7415,
      "longitude": 76.7849,
      "createdAt": "2026-10-15T10:20:00.000Z",
      "updatedAt": "2026-10-15T10:20:00.000Z"
    }
  }
  ```

---

## 5. Update Location
- **Endpoint**: `PATCH /api/locations/:id`
- **Body**: Partial fields of Location (`name`, `description`, `category`, `latitude`, `longitude`).
- **Response**: `200 OK`

---

## 6. Delete Location
- **Endpoint**: `DELETE /api/locations/:id`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "message": "Location deleted successfully"
    }
  }
  ```
