# Vibe Check API Documentation

## Base URL
```
http://localhost:3000
```

## Swagger UI
Interactive API documentation is available at:
```
http://localhost:3000/api/docs
```

Raw OpenAPI JSON is available at:
```
http://localhost:3000/api/docs.json
```

---

## Authentication
Authentication is implemented with the session cookie set at login. For note create, update, and delete operations, the authenticated user is taken from the request cookie, not from `user_id` in the request body.

---

## NOTES CRUD ENDPOINTS

### 1. CREATE NOTE
**POST** `/api/notes`

Create a new note for a location.

**Request Body:**
```json
{
  "location_id": 5,
  "content": "This place is packed right now!",
  "vibe_level": "busy",
  "is_anonymous": false
}
```

**Required Fields:**
- `location_id` (integer): ID of the location
- `content` (string): Note text (max 280 characters)
- `vibe_level` (string): One of `dead`, `quiet`, `moderate`, `busy`, `buzzing`

**Optional Fields:**
- `is_anonymous` (boolean): Default is `false`

**Response (201 Created):**
```json
{
  "message": "Note created successfully.",
  "note": {
    "note_id": 42,
    "user_id": 1,
    "location_id": 5,
    "content": "This place is packed right now!",
    "vibe_level": "busy",
    "is_anonymous": false,
    "created_at": "2026-04-27T10:30:00Z",
    "expires_at": "2026-04-28T10:30:00Z"
  }
}
```

---

### 2. GET NOTES FOR A LOCATION
**GET** `/api/notes/location/:location_id`

Get all non-expired notes for a specific location.

**Parameters:**
- `location_id` (path): ID of the location

**Query Parameters:** None

**Response (200 OK):**
```json
{
  "location_id": 5,
  "total_notes": 3,
  "notes": [
    {
      "note_id": 42,
      "user_id": 1,
      "username": "john_doe",
      "location_id": 5,
      "content": "This place is packed right now!",
      "vibe_level": "busy",
      "is_anonymous": false,
      "created_at": "2026-04-27T10:30:00Z",
      "expires_at": "2026-04-28T10:30:00Z",
      "reaction_count": 5,
      "reply_count": 2
    }
  ]
}
```

**Note:** Anonymous notes show "Anonymous" instead of username.

---

### 3. GET SPECIFIC NOTE
**GET** `/api/notes/:note_id`

Get details of a specific note.

**Parameters:**
- `note_id` (path): ID of the note

**Response (200 OK):**
```json
{
  "note_id": 42,
  "user_id": 1,
  "username": "john_doe",
  "location_id": 5,
  "content": "This place is packed right now!",
  "vibe_level": "busy",
  "is_anonymous": false,
  "created_at": "2026-04-27T10:30:00Z",
  "expires_at": "2026-04-28T10:30:00Z",
  "reaction_count": 5,
  "reply_count": 2
}
```

---

### 4. GET NOTES BY USER
**GET** `/api/notes/user/:user_id`

Get all notes created by a specific user.

**Parameters:**
- `user_id` (path): ID of the user

**Response (200 OK):**
```json
{
  "user_id": 1,
  "total_notes": 5,
  "notes": [
    {
      "note_id": 42,
      "user_id": 1,
      "location_id": 5,
      "location_name": "SFSU Library",
      "content": "This place is packed right now!",
      "vibe_level": "busy",
      "is_anonymous": false,
      "created_at": "2026-04-27T10:30:00Z",
      "expires_at": "2026-04-28T10:30:00Z",
      "reaction_count": 5,
      "reply_count": 2
    }
  ]
}
```

---

### 5. UPDATE NOTE
**PUT** `/api/notes/:note_id`

Update content or vibe_level of an existing note.

**Parameters:**
- `note_id` (path): ID of the note

**Request Body:**
```json
{
  "content": "Updated note content",
  "vibe_level": "moderate"
}
```

**Optional Fields:**
- `content` (string): New note text (max 280 characters)
- `vibe_level` (string): One of `dead`, `quiet`, `moderate`, `busy`, `buzzing`

**Note:** At least one of `content` or `vibe_level` must be provided.

**Response (200 OK):**
```json
{
  "message": "Note updated successfully.",
  "note": {
    "note_id": 42,
    "user_id": 1,
    "location_id": 5,
    "content": "Updated note content",
    "vibe_level": "moderate",
    "is_anonymous": false,
    "created_at": "2026-04-27T10:30:00Z",
    "expires_at": "2026-04-28T10:30:00Z"
  }
}
```

**Error (403 Forbidden):**
```json
{
  "error": "Unauthorized: You can only edit your own notes."
}
```

---

### 6. DELETE NOTE
**DELETE** `/api/notes/:note_id`

Delete a note.

**Parameters:**
- `note_id` (path): ID of the note

**Authentication:** The logged-in user must own the note.

**Response (200 OK):**
```json
{
  "message": "Note deleted successfully."
}
```

**Error (403 Forbidden):**
```json
{
  "error": "Unauthorized: You can only delete your own notes."
}
```

---

## REACTIONS ENDPOINTS

### 1. ADD REACTION
**POST** `/api/reactions`

Add a reaction (like) to a note.

**Request Body:**
```json
{
  "user_id": 1,
  "note_id": 42
}
```

**Required Fields:**
- `user_id` (integer): ID of the user adding the reaction
- `note_id` (integer): ID of the note to react to

**Response (201 Created):**
```json
{
  "message": "Reaction added successfully.",
  "reaction": {
    "reaction_id": 3,
    "user_id": 1,
    "note_id": 42,
    "created_at": "2026-04-27T10:35:00Z"
  }
}
```

**Note:** Each user can only add one reaction per note (constraint exists in database).

---

### 2. REMOVE REACTION
**DELETE** `/api/reactions/:reaction_id`

Remove a reaction from a note.

**Parameters:**
- `reaction_id` (path): ID of the reaction

**Request Body:**
```json
{
  "user_id": 1
}
```

**Required Fields:**
- `user_id` (integer): Must match the user who created the reaction

**Response (200 OK):**
```json
{
  "message": "Reaction removed successfully."
}
```

**Error (403 Forbidden):**
```json
{
  "error": "Unauthorized: You can only remove your own reactions."
}
```

---

## LOCATIONS ENDPOINTS

### 1. CREATE LOCATION
**POST** `/api/locations`

Create a new location.

**Request Body:**
```json
{
  "name": "SFSU Library",
  "address": "1630 Holloway Ave, San Francisco, CA",
  "lat": 37.7241,
  "lng": -122.4799,
  "category_tags": ["library", "study"],
  "radius_meters": 100.0
}
```

**Required Fields:**
- `name` (string): Name of the location
- `lat` (number): Latitude (-90 to 90)
- `lng` (number): Longitude (-180 to 180)

**Optional Fields:**
- `address` (string): Physical address
- `category_tags` (array): Categories for the location
- `radius_meters` (number): Radius in meters (default: 100)

**Response (201 Created):**
```json
{
  "message": "Location created successfully.",
  "location": {
    "location_id": 5,
    "name": "SFSU Library",
    "address": "1630 Holloway Ave, San Francisco, CA",
    "lat": 37.7241,
    "lng": -122.4799,
    "category_tags": ["library", "study"],
    "radius_meters": 100.0
  }
}
```

---

### 2. GET LOCATION DETAILS
**GET** `/api/locations/:location_id`

Get details and vibe information for a location.

**Parameters:**
- `location_id` (path): ID of the location

**Response (200 OK):**
```json
{
  "location_id": 5,
  "name": "SFSU Library",
  "address": "1630 Holloway Ave, San Francisco, CA",
  "lat": 37.7241,
  "lng": -122.4799,
  "category_tags": ["library", "study"],
  "radius_meters": 100.0,
  "total_notes": 23,
  "avg_vibe_score": 3.2
}
```

**Note:** `avg_vibe_score` is calculated from note vibe levels:
- 1 = Dead
- 2 = Quiet
- 3 = Moderate
- 4 = Busy
- 5 = Buzzing

---

### 3. UPDATE LOCATION
**PUT** `/api/locations/:location_id`

Update location details.

**Parameters:**
- `location_id` (path): ID of the location

**Request Body:**
```json
{
  "name": "SFSU Main Library",
  "address": "1630 Holloway Ave, San Francisco, CA 94132",
  "category_tags": ["library", "study", "quiet"],
  "radius_meters": 150.0
}
```

**Optional Fields:**
- `name` (string): Updated location name
- `address` (string): Updated address
- `category_tags` (array): Updated categories
- `radius_meters` (number): Updated radius

**Note:** At least one field must be provided.

**Response (200 OK):**
```json
{
  "message": "Location updated successfully.",
  "location": {
    "location_id": 5,
    "name": "SFSU Main Library",
    "address": "1630 Holloway Ave, San Francisco, CA 94132",
    "lat": 37.7241,
    "lng": -122.4799,
    "category_tags": ["library", "study", "quiet"],
    "radius_meters": 150.0
  }
}
```

---

### 4. DELETE LOCATION
**DELETE** `/api/locations/:location_id`

Delete a location and all associated notes.

**Parameters:**
- `location_id` (path): ID of the location

**Response (200 OK):**
```json
{
  "message": "Location deleted successfully."
}
```

**Important:** Deleting a location cascades to delete all notes, replies, and reactions associated with it.

---

## ERROR RESPONSES

### 400 Bad Request
```json
{
  "error": "Missing required fields: user_id, location_id, content, vibe_level"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized: You can only edit your own notes."
}
```

### 404 Not Found
```json
{
  "error": "Location not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error."
}
```

---

## COMMON STATUS CODES

| Code | Meaning |
|------|---------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid input |
| 403  | Forbidden - Unauthorized access |
| 404  | Not Found - Resource not found |
| 500  | Internal Server Error - Server error |

---

## EXAMPLE WORKFLOWS

### Workflow 1: Create a Location and Add a Note

```bash
# 1. Create location
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coffee Shop",
    "lat": 37.7749,
    "lng": -122.4194,
    "address": "123 Main St, San Francisco"
  }'

# Response: { "location_id": 10, ... }

# 2. Add a note to the location
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "location_id": 10,
    "content": "Great coffee, not too crowded",
    "vibe_level": "quiet"
  }'
```

### Workflow 2: View Location and Its Notes

```bash
# 1. Get location details
curl http://localhost:3000/api/locations/10

# 2. Get all notes for location
curl http://localhost:3000/api/notes/location/10

# 3. Get specific note
curl http://localhost:3000/api/notes/42
```

### Workflow 3: User Interacts with Notes

```bash
# 1. Add reaction to note
curl -X POST http://localhost:3000/api/reactions \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2,
    "note_id": 42
  }'

# 2. Edit own note
curl -X PUT http://localhost:3000/api/notes/42 \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "content": "Updated: Great coffee, getting crowded now",
    "vibe_level": "busy"
  }'

# 3. Delete own note
curl -X DELETE http://localhost:3000/api/notes/42 \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1}'
```

---

## NOTES

- All timestamps are in UTC format (ISO 8601)
- Notes expire after 24 hours by default
- Expired notes are not returned in queries
- Deleting a location cascades to all related notes, replies, and reactions
- User authorization is checked by `user_id` matching
- Each user can add only one reaction per note

---

## FUTURE ENHANCEMENTS

- [ ] Add JWT authentication
- [ ] Add rate limiting
- [ ] Add search filtering and pagination
- [ ] Add reply endpoints for note responses
- [ ] Add user profile endpoints
- [ ] Add friend/follow endpoints
- [ ] Add badges/achievements system
- [ ] Add heatmap data aggregation endpoints
