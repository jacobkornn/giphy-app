# Giphy Search

## Overview
This project is a Giphy search application featuring user authentication, GIF ratings, and comments. It includes a React frontend and an Express backend which communicates with the Giphy API and manages user data in a database.

## Frontend
- Built with React.
- Users can search for GIFs through the backend proxy.
- Supports user login to enable rating and commenting on GIFs.
- Displays GIFs in a responsive grid with interactive rating stars and comment sections.

## Backend
- Built with Express and Prisma ORM.
- Handles user authentication using JWT tokens.
- Provides endpoints for user login, fetching/posting ratings and comments, and searching GIFs via the Giphy API proxy.

## Running the Project Locally
1. Clone the repository
2. This project uses [Supabase](https://supabase.com/) for PostgreSQL and manages schema locally via [Prisma](https://www.prisma.io/). After creating a database, find your DATABASE_URL, DIRECT_URL connection strings.

3. Install Prisma, Generate Client, Apply Migrations
      ```bash
    npm install prisma --save-dev && npx prisma generate && npx prisma migrate dev --name init
   
5. Create a .env file in the server directory with:
      ```bash
   
   DATABASE_URL=<your_db_url>
   DIRECT_URL=<your_direct_url>
   JWT_SECRET=<your_jwt_secret>
   GIPHY_API_KEY=<your_giphy_api_key>

6. Install all project dependencies
   ```bash
   npm install
7. Run the project
   ```bash
   npm start
