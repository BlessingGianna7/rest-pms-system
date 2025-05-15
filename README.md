# Vehicle Parking Management System

**logic behing** https://docs.google.com/document/d/1Yrze_Xae5kayjPDFK7JNiUP-s_3tgLYHjQJm9rfyZIg/edit?tab=t.0

## VPMS Backend

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone <repo_url>
   cd backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up PostgreSQL**:
   - Create a database named `parking_db`.
   - Run the following SQL to create tables:
     ```sql
     CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       name VARCHAR(100),
       email VARCHAR(100) UNIQUE,
       password VARCHAR(100),
       role VARCHAR(20) DEFAULT 'user'
     );

     CREATE TABLE vehicles (
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES users(id),
       plate_number VARCHAR(20) UNIQUE,
       vehicle_type VARCHAR(50),
       size VARCHAR(20),
       other_attributes JSONB
     );

     CREATE TABLE parking_slots (
       id SERIAL PRIMARY KEY,
       slot_number VARCHAR(10) UNIQUE,
       size VARCHAR(20),
       vehicle_type VARCHAR(50),
       status VARCHAR(20) DEFAULT 'available',
       location VARCHAR(100)
     );

     CREATE TABLE slot_requests (
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES users(id),
       vehicle_id INTEGER REFERENCES vehicles(id),
       slot_id INTEGER REFERENCES parking_slots(id),
       request_status VARCHAR(20) DEFAULT 'pending',
       requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       approved_at TIMESTAMP,
       slot_number VARCHAR(10)
     );

     CREATE TABLE logs (
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES users(id),
       action VARCHAR(100),
       timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     ```

4. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your PostgreSQL connection string, JWT secret, and Nodemailer credentials.

5. **Run the Server**:
   ```bash
   npm start
   ```
   - For development with auto-restart:
     ```bash
     npm run dev
     ```

6. **Access Swagger Documentation**:
   - Open `http://localhost:5000/api-docs` in your browser to view the API documentation.

### API Endpoints

- **Auth**:
  - `POST /api/auth/register`: Register a user.
  - `POST /api/auth/login`: Login and get JWT.

- **Users**:
  - `GET /api/users/profile`: Get user profile (authenticated).
  - `PUT /api/users/profile`: Update profile (authenticated).
  - `GET /api/users?page=1&limit=10&search=term`: List users (admin, paginated, searchable).
  - `DELETE /api/users/:id`: Delete user (admin).

- **Vehicles**:
  - `POST /api/vehicles`: Create vehicle (authenticated).
  - `GET /api/vehicles?page=1&limit=10&search=term`: List vehicles (authenticated, paginated, searchable).
  - `PUT /api/vehicles/:id`: Update vehicle (authenticated).
  - `DELETE /api/vehicles/:id`: Delete vehicle (authenticated).

- **Parking Slots**:
  - `POST /api/parking-slots/bulk`: Create multiple slots (admin).
  - `GET /api/parking-slots?page=1&limit=10&search=term`: List slots (authenticated, paginated, searchable).
  - `PUT /api/parking-slots/:id`: Update slot (admin).
  - `DELETE /api/parking-slots/:id`: Delete slot (admin).

- **Slot Requests**:
  - `POST /api/slot-requests`: Create request (authenticated).
  - `GET /api/slot-requests?page=1&limit=10&search=term`: List requests (authenticated, paginated, searchable).
  - `PUT /api/slot-requests/:id`: Update request (authenticated, pending only).
  - `DELETE /api/slot-requests/:id`: Delete request (authenticated, pending only).
  - `PUT /api/slot-requests/:id/approve`: Approve request (admin).
  - `PUT /api/slot-requests/:id/reject`: Reject request (admin).

### Notes
- Ensure PostgreSQL is running and the database is configured.
- Nodemailer requires valid SMTP credentials (e.g., Gmail with app password).
- Pagination and search are implemented for GET endpoints using `page`, `limit`, and `search` query parameters.
- All actions are logged in the `logs` table.
- Swagger documentation is available at `/api-docs`.


## VPMS Frontend

### Setup Instructions
**1. Navigate to Frontend Directory:**
```
cd frontend
```
**2. Install Dependencies:**
```
pnpm install
```
Ensures React, React Router, Axios, Tailwind CSS, and other dependencies are installed.

**3. Configure Environment Variables:**
Configure Environment Variables:
```
cp .env.example .env

```
**3. Run frontend:**
```
pnpm start 
```