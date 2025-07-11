# 🎬 Giphy Search

## 📝 Overview
This project is a Giphy search application featuring user authentication, GIF ratings, and comments. It includes a React frontend and an Express backend that communicates with the Giphy API and manages user data in a PostgreSQL database.

---

## ⚛️ Frontend

- Built with React.
- Users can search for GIFs through the backend proxy.
- Supports user login to enable rating and commenting on GIFs.
- Displays GIFs in a responsive grid with interactive rating stars and comment sections.

---

## 🚀 Backend

- Built with Express and Prisma ORM.
- Handles user authentication using JWT tokens.
- Provides endpoints for login, GIF search, and rating/comment features.
- Interfaces with Supabase-hosted PostgreSQL for user and GIF data.

---

## 🏃‍♂️ Running the Project Locally

### 1. Clone the Repository

### 2. Supabase + Prisma Database Setup

This project uses [Supabase](https://supabase.com/) for PostgreSQL and manages the schema locally with [Prisma](https://www.prisma.io/).

Go to your Supabase project and navigate to:

- **Connect → ORMs**
  - Copy the `DATABASE_URL`
  - Copy the `DIRECT_URL`

---

### 3. Retrieve API Keys & Secrets

| Key Name        | Description                                                             |
|-----------------|-------------------------------------------------------------------------|
| `DATABASE_URL`  | Supabase connection string                                              |
| `DIRECT_URL`    | Direct admin connection string (Prisma)                                 |
| `JWT_SECRET`    | Secret used for signing/verifying JWT tokens                            |
| `GIPHY_API_KEY` | API key from [Giphy Developers](https://developers.giphy.com/explorer/) |

Generate a secure `JWT_SECRET` value locally:

```bash
openssl rand -hex 32
```

---

### 4. Create a `.env` File

Create a `.env` file in the `/server` directory and add:

```env
DATABASE_URL="your_database_url"
DIRECT_URL="your_direct_url"
JWT_SECRET="your_jwt_secret"
GIPHY_API_KEY="your_giphy_api_key"
```

> 🔒 Ensure `.env` is listed in `.gitignore` to keep secrets secure.

---

### 5. Install Prisma, Generate Client, and Apply Migrations
Run this command from the root directory:

```bash
cd server; npm install prisma --save-dev; npx prisma generate; npx prisma migrate dev --name init
```

---

### 6. Install Project Dependencies (from root)
Run this command from the root directory:

```bash
npm run install-all
```


---

### 7. Start the Application 
Run this command from the root directory:

```bash
npm start
```

