import swaggerJSDoc from "swagger-jsdoc";

const vibeLevelEnum = ["dead", "quiet", "moderate", "busy", "buzzing"];

const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Vibe Check API",
            version: "1.0.0",
            description: "Interactive API documentation for the Vibe Check backend."
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local development server"
            }
        ],
        tags: [
            { name: "Auth" },
            { name: "Search" },
            { name: "Notes" },
            { name: "Reactions" },
            { name: "Locations" }
        ],
        components: {
            schemas: {
                ErrorResponse: {
                    type: "object",
                    properties: {
                        error: { type: "string" }
                    },
                    required: ["error"]
                },
                LoginRequest: {
                    type: "object",
                    properties: {
                        email: { type: "string", format: "email" },
                        password: { type: "string" }
                    },
                    required: ["email", "password"]
                },
                SignupRequest: {
                    type: "object",
                    properties: {
                        username: { type: "string" },
                        email: { type: "string", format: "email" },
                        password: { type: "string", minLength: 8 }
                    },
                    required: ["username", "email", "password"]
                },
                AuthUser: {
                    type: "object",
                    properties: {
                        user_id: { type: "integer" },
                        username: { type: "string" },
                        email: { type: "string", format: "email" }
                    },
                    required: ["user_id", "username", "email"]
                },
                LoginResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        user: { $ref: "#/components/schemas/AuthUser" }
                    },
                    required: ["message", "user"]
                },
                MessageResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string" }
                    },
                    required: ["message"]
                },
                SearchLocation: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        name: { type: "string" },
                        lat: { type: "number" },
                        lon: { type: "number" },
                        type: { type: "string" },
                        category: { type: "string" }
                    },
                    required: ["id", "name", "lat", "lon", "type", "category"]
                },
                CreateNoteRequest: {
                    type: "object",
                    properties: {
                        location_id: { type: "integer" },
                        category_tag: {
                            type: "string",
                            enum: ["na", "Restaurant", "Libraries", "Bar", "Cafe", "Park", "Museum", "Shopping", "Entertainment", "Nightlife"]
                        },
                        content: { type: "string", maxLength: 280 },
                        vibe_level: { type: "string", enum: vibeLevelEnum },
                        is_anonymous: { type: "boolean", default: false }
                    },
                    required: ["location_id", "category_tag", "content", "vibe_level"]
                },
                UpdateNoteRequest: {
                    type: "object",
                    properties: {
                        category_tag: {
                            type: "string",
                            enum: ["na", "Restaurant", "Libraries", "Bar", "Cafe", "Park", "Museum", "Shopping", "Entertainment", "Nightlife"]
                        },
                        content: { type: "string", maxLength: 280 },
                        vibe_level: { type: "string", enum: vibeLevelEnum }
                    }
                },
                DeleteOwnedResourceRequest: {
                    type: "object",
                    properties: {
                        user_id: { type: "integer" }
                    },
                    required: ["user_id"]
                },
                Note: {
                    type: "object",
                    properties: {
                        note_id: { type: "integer" },
                        user_id: { type: "integer" },
                        location_id: { type: "integer" },
                        category_tag: { type: "string" },
                        content: { type: "string" },
                        vibe_level: { type: "string", enum: vibeLevelEnum },
                        is_anonymous: { type: "boolean" },
                        created_at: { type: "string", format: "date-time" },
                        expires_at: { type: "string", format: "date-time" }
                    },
                    required: [
                        "note_id",
                        "user_id",
                        "location_id",
                        "category_tag",
                        "content",
                        "vibe_level",
                        "is_anonymous",
                        "created_at",
                        "expires_at"
                    ]
                },
                NoteSummary: {
                    allOf: [
                        { $ref: "#/components/schemas/Note" },
                        {
                            type: "object",
                            properties: {
                                username: { type: "string" },
                                reaction_count: { type: "string" },
                                reply_count: { type: "string" }
                            },
                            required: ["username", "reaction_count", "reply_count"]
                        }
                    ]
                },
                UserNoteSummary: {
                    allOf: [
                        { $ref: "#/components/schemas/Note" },
                        {
                            type: "object",
                            properties: {
                                location_name: { type: "string" },
                                category_tag: { type: "string" },
                                reaction_count: { type: "string" },
                                reply_count: { type: "string" }
                            },
                            required: ["location_name", "category_tag", "reaction_count", "reply_count"]
                        }
                    ]
                },
                NoteResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        note: { $ref: "#/components/schemas/Note" }
                    },
                    required: ["message", "note"]
                },
                NotesByLocationResponse: {
                    type: "object",
                    properties: {
                        location_id: { type: "integer" },
                        total_notes: { type: "integer" },
                        notes: {
                            type: "array",
                            items: { $ref: "#/components/schemas/NoteSummary" }
                        }
                    },
                    required: ["location_id", "total_notes", "notes"]
                },
                NotesByUserResponse: {
                    type: "object",
                    properties: {
                        user_id: { type: "integer" },
                        total_notes: { type: "integer" },
                        notes: {
                            type: "array",
                            items: { $ref: "#/components/schemas/UserNoteSummary" }
                        }
                    },
                    required: ["user_id", "total_notes", "notes"]
                },
                CreateReactionRequest: {
                    type: "object",
                    properties: {
                        user_id: { type: "integer" },
                        note_id: { type: "integer" }
                    },
                    required: ["user_id", "note_id"]
                },
                Reaction: {
                    type: "object",
                    properties: {
                        reaction_id: { type: "integer" },
                        user_id: { type: "integer" },
                        note_id: { type: "integer" },
                        created_at: { type: "string", format: "date-time" }
                    },
                    required: ["reaction_id", "user_id", "note_id", "created_at"]
                },
                ReactionResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        reaction: { $ref: "#/components/schemas/Reaction" }
                    },
                    required: ["message", "reaction"]
                },
                CreateLocationRequest: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        address: { type: "string", nullable: true },
                        lat: { type: "number" },
                        lng: { type: "number" },
                        category_tags: {
                            type: "array",
                            items: { type: "string" },
                            nullable: true
                        },
                        radius_meters: { type: "number", default: 100 }
                    },
                    required: ["name", "lat", "lng"]
                },
                UpdateLocationRequest: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        address: { type: "string", nullable: true },
                        category_tags: {
                            type: "array",
                            items: { type: "string" },
                            nullable: true
                        },
                        radius_meters: { type: "number" }
                    }
                },
                Location: {
                    type: "object",
                    properties: {
                        location_id: { type: "integer" },
                        name: { type: "string" },
                        address: { type: "string", nullable: true },
                        lat: { type: "number" },
                        lng: { type: "number" },
                        category_tags: {
                            type: "array",
                            items: { type: "string" },
                            nullable: true
                        },
                        radius_meters: { type: "number" }
                    },
                    required: ["location_id", "name", "lat", "lng", "radius_meters"]
                },
                LocationDetails: {
                    allOf: [
                        { $ref: "#/components/schemas/Location" },
                        {
                            type: "object",
                            properties: {
                                total_notes: { type: "string" },
                                avg_vibe_score: {
                                    oneOf: [
                                        { type: "string" },
                                        { type: "number" },
                                        { type: "null" }
                                    ]
                                }
                            },
                            required: ["total_notes", "avg_vibe_score"]
                        }
                    ]
                },
                LocationResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        location: { $ref: "#/components/schemas/Location" }
                    },
                    required: ["message", "location"]
                }
            }
        },
        paths: {
            "/api/search/locations": {
                get: {
                    tags: ["Search"],
                    summary: "Search for locations using Nominatim",
                    parameters: [
                        {
                            in: "query",
                            name: "q",
                            required: true,
                            schema: { type: "string" },
                            description: "Free-text location query"
                        }
                    ],
                    responses: {
                        200: {
                            description: "Matching locations",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "array",
                                        items: { $ref: "#/components/schemas/SearchLocation" }
                                    }
                                }
                            }
                        },
                        400: {
                            description: "Missing query",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        502: {
                            description: "Upstream geocoder failure",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            },
            "/api/login": {
                post: {
                    tags: ["Auth"],
                    summary: "Authenticate a user",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/LoginRequest" }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Login successful",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/LoginResponse" }
                                }
                            }
                        },
                        400: {
                            description: "Validation error",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        401: {
                            description: "Invalid credentials",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            },
            "/api/signup": {
                post: {
                    tags: ["Auth"],
                    summary: "Create a new user account",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/SignupRequest" }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: "Signup successful",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/MessageResponse" }
                                }
                            }
                        },
                        400: {
                            description: "Validation error",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        409: {
                            description: "Username or email conflict",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            },
            "/api/notes": {
                post: {
                    tags: ["Notes"],
                    summary: "Create a note",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/CreateNoteRequest" }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: "Note created",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/NoteResponse" }
                                }
                            }
                        },
                        400: {
                            description: "Validation error",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        404: {
                            description: "User or location not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            },
            "/api/notes/location/{location_id}": {
                get: {
                    tags: ["Notes"],
                    summary: "Get notes for a location",
                    parameters: [
                        {
                            in: "path",
                            name: "location_id",
                            required: true,
                            schema: { type: "integer" }
                        }
                    ],
                    responses: {
                        200: {
                            description: "Notes for the location",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/NotesByLocationResponse" }
                                }
                            }
                        },
                        404: {
                            description: "Location not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            },
            "/api/notes/{note_id}": {
                get: {
                    tags: ["Notes"],
                    summary: "Get a note by id",
                    parameters: [
                        {
                            in: "path",
                            name: "note_id",
                            required: true,
                            schema: { type: "integer" }
                        }
                    ],
                    responses: {
                        200: {
                            description: "Note details",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/NoteSummary" }
                                }
                            }
                        },
                        404: {
                            description: "Note not found or expired",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                },
                put: {
                    tags: ["Notes"],
                    summary: "Update a note",
                    parameters: [
                        {
                            in: "path",
                            name: "note_id",
                            required: true,
                            schema: { type: "integer" }
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/UpdateNoteRequest" }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Note updated",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/NoteResponse" }
                                }
                            }
                        },
                        400: {
                            description: "Validation error",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        403: {
                            description: "User does not own the note",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        404: {
                            description: "Note not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                },
                delete: {
                    tags: ["Notes"],
                    summary: "Delete a note",
                    parameters: [
                        {
                            in: "path",
                            name: "note_id",
                            required: true,
                            schema: { type: "integer" }
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/DeleteOwnedResourceRequest" }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Note deleted",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/MessageResponse" }
                                }
                            }
                        },
                        403: {
                            description: "User does not own the note",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        404: {
                            description: "Note not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            },
            "/api/notes/user/{user_id}": {
                get: {
                    tags: ["Notes"],
                    summary: "Get notes created by a user",
                    parameters: [
                        {
                            in: "path",
                            name: "user_id",
                            required: true,
                            schema: { type: "integer" }
                        }
                    ],
                    responses: {
                        200: {
                            description: "User notes",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/NotesByUserResponse" }
                                }
                            }
                        },
                        404: {
                            description: "User not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            },
            "/api/reactions": {
                post: {
                    tags: ["Reactions"],
                    summary: "Add a reaction to a note",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/CreateReactionRequest" }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: "Reaction created",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ReactionResponse" }
                                }
                            }
                        },
                        200: {
                            description: "Reaction already exists",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/MessageResponse" }
                                }
                            }
                        },
                        404: {
                            description: "Note not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            },
            "/api/reactions/{reaction_id}": {
                delete: {
                    tags: ["Reactions"],
                    summary: "Delete a reaction",
                    parameters: [
                        {
                            in: "path",
                            name: "reaction_id",
                            required: true,
                            schema: { type: "integer" }
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/DeleteOwnedResourceRequest" }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Reaction deleted",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/MessageResponse" }
                                }
                            }
                        },
                        403: {
                            description: "User does not own the reaction",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        404: {
                            description: "Reaction not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            },
            "/api/locations": {
                post: {
                    tags: ["Locations"],
                    summary: "Create a location",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/CreateLocationRequest" }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: "Location created",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/LocationResponse" }
                                }
                            }
                        },
                        400: {
                            description: "Validation error",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            },
            "/api/locations/{location_id}": {
                get: {
                    tags: ["Locations"],
                    summary: "Get a location by id",
                    parameters: [
                        {
                            in: "path",
                            name: "location_id",
                            required: true,
                            schema: { type: "integer" }
                        }
                    ],
                    responses: {
                        200: {
                            description: "Location details",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/LocationDetails" }
                                }
                            }
                        },
                        404: {
                            description: "Location not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                },
                put: {
                    tags: ["Locations"],
                    summary: "Update a location",
                    parameters: [
                        {
                            in: "path",
                            name: "location_id",
                            required: true,
                            schema: { type: "integer" }
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/UpdateLocationRequest" }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Location updated",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/LocationResponse" }
                                }
                            }
                        },
                        400: {
                            description: "Validation error",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        404: {
                            description: "Location not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                },
                delete: {
                    tags: ["Locations"],
                    summary: "Delete a location",
                    parameters: [
                        {
                            in: "path",
                            name: "location_id",
                            required: true,
                            schema: { type: "integer" }
                        }
                    ],
                    responses: {
                        200: {
                            description: "Location deleted",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/MessageResponse" }
                                }
                            }
                        },
                        404: {
                            description: "Location not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: []
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
