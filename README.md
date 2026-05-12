# Travel Planner Backend API

Backend API skeleton for a travel planning platform built with **Node.js** and **Express**.

The API uses **mock data only**. No real database is connected yet.  
Data is stored in memory and resets when the server restarts.

## Resources

The API includes three resources:

- Users
- Trips
- Friends

These match the project idea of a travel platform where users can create trips, save travel plans, and manage friends.

---

## Project Structure

```txt
backend/
├── server.js
├── package.json
├── README.md
├── controllers/
├── routes/
├── models/
├── middleware/
└── docs/
    ├── postman_collection.json
    └── screenshots/
```

---

## Installation

Open a terminal inside the `backend` folder.

```bash
npm install
```

On Windows PowerShell, if `npm` is blocked, use:

```bash
npm.cmd install
```

---

## Run the Server

```bash
npm start
```

Or:

```bash
npm.cmd start
```

Or:

```bash
node server.js
```

Server runs at:

```txt
http://localhost:3000
```

API base path:

```txt
/
```

Main routes:

```txt
/users
/trips
/friends
```

---

## Assumptions

- Mock data only, no MySQL/database yet.
- Data resets when the server restarts.
- IDs are generated automatically using the current max ID + 1.
- Authentication is simulated with the `x-user-role` header.
- All responses are JSON.

---

## Response Format

### Success

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### Error

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message.",
    "details": {}
  }
}
```

---

## Authorization

Protected routes use this request header:

```txt
x-user-role: admin
```

Available roles:

```txt
admin
manager
user
```

| Action | Allowed Roles |
|---|---|
| Create user | admin |
| Update user | admin, manager |
| Delete user | admin |
| Create trip | admin, manager, user |
| Update trip | admin, manager |
| Delete trip | admin |
| Get all friendships | admin, manager |
| Create friendship | admin, manager, user |
| Update friendship | admin, manager |
| Delete friendship | admin |

Public routes do not require a role header.

---

# API Reference

## Users

| Method | Path | Description | Body/Header |
|---|---|---|---|
| GET | `/users` | Get all users | None |
| GET | `/users/:id` | Get user by ID | None |
| POST | `/users` | Create user | Body + `x-user-role: admin` |
| PUT | `/users/:id` | Update user | Body + `x-user-role: admin` or `manager` |
| DELETE | `/users/:id` | Delete user | `x-user-role: admin` |

### POST /users Body

```json
{
  "username": "lina22",
  "firstName": "Lina",
  "lastName": "Cohen",
  "email": "lina@email.com",
  "password": "123456",
  "userRole": "user"
}
```

---

## Trips

| Method | Path | Description | Body/Header |
|---|---|---|---|
| GET | `/trips` | Get all trips | Optional query params |
| GET | `/trips/:id` | Get trip by ID | None |
| POST | `/trips` | Create trip | Body + `x-user-role: user/admin/manager` |
| PUT | `/trips/:id` | Update trip | Body + `x-user-role: admin` or `manager` |
| DELETE | `/trips/:id` | Delete trip | `x-user-role: admin` |

### Trip Query Params

```txt
/trips?destination=Japan
/trips?status=planned
/trips?name=food
```

### POST /trips Body

```json
{
  "tripName": "Rome Food Trip",
  "destination": "Rome, Italy",
  "startDate": "2026-07-10",
  "endDate": "2026-07-14",
  "description": "A relaxed trip focused on food and hidden gems.",
  "createdBy": 1,
  "participants": [1, 2],
  "budget": 900,
  "status": "planned"
}
```

---

## Friends

| Method | Path | Description | Body/Header |
|---|---|---|---|
| GET | `/friends` | Get all friendship records | `x-user-role: admin` or `manager` |
| GET | `/friends/:userId` | Get friends by user ID | None |
| POST | `/friends` | Create friendship | Body + `x-user-role: user/admin/manager` |
| PUT | `/friends/:id` | Update friendship status | Body + `x-user-role: admin` or `manager` |
| DELETE | `/friends/:id` | Delete friendship | `x-user-role: admin` |

### POST /friends Body

```json
{
  "userId": 2,
  "friendId": 5
}
```

### PUT /friends/:id Body

```json
{
  "status": "accepted"
}
```

Allowed statuses:

```txt
pending
accepted
blocked
```

---

# Example Responses

## Example Success Response

Request:

```txt
GET /trips/1
```

Response:

```json
{
  "success": true,
  "data": {
    "tripId": 1,
    "tripName": "Japan Hidden Gems Adventure",
    "destination": "Tokyo, Japan",
    "status": "planned"
  },
  "error": null
}
```

## Example Validation Error

Request:

```txt
POST /trips
```

Body:

```json
{
  "destination": "Paris, France"
}
```

Response:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields.",
    "details": {
      "required": ["tripName", "destination", "startDate", "endDate", "budget", "status"]
    }
  }
}
```

## Example Not Found Error

Request:

```txt
GET /users/999
```

Response:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found.",
    "details": {
      "id": 999
    }
  }
}
```

## Example Forbidden Error

Request without role header:

```txt
DELETE /trips/1
```

Response:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "details": {
      "requiredHeader": "x-user-role"
    }
  }
}
```

---

# Postman Collection

The exported Postman collection is included at:

```txt
docs/postman_collection.json
```

The collection:

- Uses the correct HTTP methods.
- Includes request bodies for POST and PUT requests.
- Includes path params such as `/users/1`, `/trips/1`, `/friends/1`.
- Includes query params such as `/trips?destination=Japan`.
- Uses clear request names.
- Is organized into folders by resource:
  - Server
  - Users
  - Trips
  - Friends
  - Error Examples
- Works against:

```txt
http://localhost:3000
```

To use it:

1. Start the server.
2. Open Postman.
3. Import `docs/postman_collection.json`.
4. Send requests from the imported collection.

---

# Postman Screenshots

Screenshots are included in:

```txt
docs/screenshots/
```

Required screenshots:

| Screenshot | Request |
|---|---|
| `users_success.png` | Successful Users request |
| `trips_success.png` | Successful Trips request |
| `friends_success.png` | Successful Friends request |
| `validation_error.png` | Example error request |

Each screenshot should show the request URL, method, response status code, and JSON response body.

---

## Notes

- Run DELETE requests last because they remove mock data during the current server session.
- Restart the server to reset mock data.