
# C-Force AI Deployment Guide

## System Requirements
- Node.js v18+
- PostgreSQL v14+
- Google Cloud API Key (Gemini)

## Database Setup (PostgreSQL)

To connect the application to a live PostgreSQL database:

1.  **Create Database:**
    ```bash
    createdb cforce_ai
    ```

2.  **Initialize Schema & Admin User:**
    Run the initialization script to create tables and the default `admin` user.
    ```bash
    psql -d cforce_ai -f db/init.sql
    ```

3.  **Default Credentials:**
    *   **User:** `admin`
    *   **Pass:** `admin123`

## Environment Variables (.env)

Configure your backend to connect to the database:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_postgres_password
DB_NAME=cforce_ai

# AI Services
API_KEY=your_google_gemini_api_key
```

## Security Note
For production deployment, ensure `server.ts` utilizes `bcrypt` or `argon2` to hash passwords before storing them in the database. The default `init.sql` provides a plaintext password for initial setup only.
