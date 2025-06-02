# Property Management Backend

A full-featured backend for property listing, search, recommendation, and user management using Node.js, TypeScript, MongoDB, and Redis.

## Features

- User registration and login with JWT
- Property creation, update, delete (restricted to creator)
- Advanced search and filtering
- Redis caching for performance
- Favorites management
- Property recommendation to other users
- CSV import for bulk property addition
- Docker-compatible (MongoDB and Redis)
- Deployment-ready (e.g., Render)

## Tech Stack

- TypeScript + Node.js + Express
- MongoDB (Mongoose)
- Redis (ioredis)
- JWT for Auth
- Docker (MongoDB, Redis containers)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://your-repo-url.git
cd backend
```

### 2. Add Property listing data  

Place CSV file inside scripts/data folder  

### 2. Set up environment variables

Create a `.env` file:

```
MONGO_INITDB_ROOT_USERNAME=your_mongodb_username
MONGO_INITDB_ROOT_PASSWORD=your_mongodb_password
JWT_SECRET=your_jwt_secret
```

### 3. Run the server

```bash
docker compose up --build 
```
    


## API Endpoints

### Auth

- `POST /api/auth/register` – Register user
- `POST /api/auth/login` – Login user

### Properties

- `POST /api/properties` – Create property (auth required)
- `GET /api/properties/:id` – Get property 
- `PUT /api/properties/:id` – Update property (only creator)
- `DELETE /api/properties/:id` – Delete property (only creator)

### Search & Filter

- `POST /api/properties/search` – Search by title
- `POST /api/properties/filter` – Filter by attributes

### Favorites

- `POST /api/favorites/:propertyId`
- `GET /api/favorites`
- `DELETE /api/favorites/:propertyId`

### Recommendations

- `POST /api/recommend/:propertyId` – Recommend property by email
- `GET /api/recommendations` – View properties recommended to user

---

## Deployment
   
### Sample Usage:  
http://localhost:5000/api/auth/register


