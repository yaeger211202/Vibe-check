# Vibe Check Backend API - Complete Guide

## 📁 Project Structure

```
backend/
├── server.js               (Main server - 164 lines)
├── routes/
│   ├── notesRoutes.js     (Notes CRUD: /api/notes/*)
│   ├── reactionsRoutes.js (Reactions: /api/reactions/*)
│   └── locationsRoutes.js (Locations: /api/locations/*)
├── database/
│   └── schema.sql
└── package.json
```

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Server runs on http://localhost:3000
```

---

## 📚 API ENDPOINTS

### NOTES - Location Reviews/Comments

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/notes` | Create new note |
| GET | `/api/notes/location/:location_id` | Get notes for location |
| GET | `/api/notes/:note_id` | Get specific note |
| GET | `/api/notes/user/:user_id` | Get user's notes |
| PUT | `/api/notes/:note_id` | Edit note |
| DELETE | `/api/notes/:note_id` | Delete note |

**POST /api/notes**
```json
{
  "user_id": 1,
  "location_id": 5,
  "content": "This place is packed right now!",
  "vibe_level": "busy",
  "is_anonymous": false
}
```
Response: `201 Created` with note details

**GET /api/notes/location/5**
```json
{
  "location_id": 5,
  "total_notes": 3,
  "notes": [
    {
      "note_id": 42,
      "username": "john_doe",
      "content": "This place is packed right now!",
      "vibe_level": "busy",
      "created_at": "2026-04-27T10:30:00Z",
      "reaction_count": 5,
      "reply_count": 2
    }
  ]
}
```

---

### REACTIONS - Likes on Notes

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/reactions` | Add like to note |
| DELETE | `/api/reactions/:reaction_id` | Remove like |

**POST /api/reactions**
```json
{
  "user_id": 2,
  "note_id": 42
}
```
Response: `201 Created` with reaction details

---

### LOCATIONS - Places

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/locations` | Create location |
| GET | `/api/locations/:location_id` | Get location info |
| PUT | `/api/locations/:location_id` | Update location |
| DELETE | `/api/locations/:location_id` | Delete location |

**POST /api/locations**
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

**GET /api/locations/5**
```json
{
  "location_id": 5,
  "name": "SFSU Library",
  "lat": 37.7241,
  "lng": -122.4799,
  "total_notes": 23,
  "avg_vibe_score": 3.2
}
```

---

## 🔑 Vibe Levels

```
dead      → 1 (Nobody here)
quiet     → 2 (Very quiet)
moderate  → 3 (Decent vibe)
busy      → 4 (Crowded)
buzzing   → 5 (Very busy/fun)
```

---

## 💡 How It All Works

### Relationship Flow

```
LOCATION (Place)
    ↓
    ├─→ NOTES (Reviews about the place)
    │        ↓
    │        └─→ REACTIONS (Likes on reviews)
```

### Real Example

**Step 1: Create a Location**
```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coffee Shop Downtown",
    "lat": 37.7749,
    "lng": -122.4194
  }'
# Returns: location_id: 10
```

**Step 2: Add Notes**
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "location_id": 10,
    "content": "Great espresso, not too crowded",
    "vibe_level": "quiet"
  }'
# Returns: note_id: 42
```

**Step 3: Add Reactions**
```bash
curl -X POST http://localhost:3000/api/reactions \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2,
    "note_id": 42
  }'
# Returns: reaction_id: 3
```

**Step 4: View Location with Stats**
```bash
curl http://localhost:3000/api/locations/10
# Returns: total_notes: 1, avg_vibe_score: 2.0
```

---

## 🛡️ Authorization & Security

- Users can **only edit/delete their own notes**
- Users can **only remove their own reactions**
- Returns `403 Forbidden` for unauthorized access
- All inputs validated server-side

---

## ⚠️ Error Responses

```json
// 400 Bad Request
{ "error": "Missing required fields: user_id, location_id, content, vibe_level" }

// 403 Forbidden
{ "error": "Unauthorized: You can only edit your own notes." }

// 404 Not Found
{ "error": "Location not found." }

// 500 Internal Server Error
{ "error": "Internal server error." }
```

---

## 📋 Features

✅ **Notes CRUD** - Create, read, update, delete location notes
✅ **Reactions** - Like/react to notes
✅ **Locations** - Manage places and view vibe statistics
✅ **Auto-expiring Notes** - Notes expire after 24 hours
✅ **Anonymous Posts** - Users can post anonymously
✅ **Vibe Scoring** - Calculate average vibe level per location
✅ **Input Validation** - All fields validated
✅ **Authorization** - Users can only modify their own data
✅ **Engagement Metrics** - Track reaction and reply counts
✅ **Efficient Queries** - Database indexes for fast lookups

---

## 📂 File Organization

### Why 3 Route Files?

**notesRoutes.js** - Handles all note operations
- Creating reviews about places
- Reading notes by location or user
- Editing and deleting notes

**reactionsRoutes.js** - Handles all reaction operations
- Adding likes to notes
- Removing likes
- Prevents duplicate reactions per user

**locationsRoutes.js** - Handles all location operations
- Creating new places
- Viewing location info and vibe stats
- Updating location details
- Deleting locations

**Why Separate?**
- Clean code organization (single responsibility)
- RESTful design (each resource has its own file)
- Easy to maintain and test
- Easy to scale and add new features
- Team can work on different files independently

---

## 🔌 Integration Notes

### Frontend Requests

```javascript
// Create a note
const response = await fetch('http://localhost:3000/api/notes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 1,
    location_id: 5,
    content: "Great place!",
    vibe_level: "quiet"
  })
});

// Get notes for location
const notes = await fetch('http://localhost:3000/api/notes/location/5');

// Add reaction
const reaction = await fetch('http://localhost:3000/api/reactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id: 1, note_id: 42 })
});
```

---

## 📊 Database Schema Summary

**notes table**
- note_id (PK)
- user_id (FK to users)
- location_id (FK to locations)
- content (max 280 chars)
- vibe_level (dead, quiet, moderate, busy, buzzing)
- expires_at (24 hours from creation)
- is_anonymous (boolean)

**reactions table**
- reaction_id (PK)
- user_id (FK to users)
- note_id (FK to notes)
- Unique constraint: (user_id, note_id)

**locations table**
- location_id (PK)
- name
- address
- lat, lng (coordinates)
- category_tags (array)
- radius_meters
- geom (PostGIS geography)

---

## 🚀 Future Enhancements

- [ ] Add reply endpoints for nested comments
- [ ] Add JWT authentication
- [ ] Add rate limiting
- [ ] Add search and filtering
- [ ] Add pagination support
- [ ] Add badges/achievements
- [ ] Add real-time updates with WebSockets
- [ ] Add image uploads for notes
- [ ] Add friend/follow system

---

## 📞 Support

For issues:
1. Check error response in console
2. Verify all required fields are provided
3. Ensure user_id and location_id exist
4. Check database is running
5. Verify authentication (if implemented)

---

## Status: ✅ READY TO USE

All endpoints tested and working!
- No compilation errors
- All validations in place
- Database schema ready
- Authorization working
- Error handling complete


