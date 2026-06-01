# CineScribe

A full-stack web application designed to help users search, log, and review their favorite movies and books. 

Built with a React/Vite frontend and an Express.js backend, CineScribe leverages the OMDB API for real-time media metadata and relies on a cloud-hosted PostgreSQL database for secure user authentication and data persistence.

## Features
* **Real-Time Media Search:** Dynamically search for movies and shows utilizing the OMDB API.
* **Interactive Reviews:** Rate media from 1-5 stars and write detailed personal reviews.
* **Secure Authentication:** User accounts with encrypted session management.
* **Responsive UI:** A clean, modern interface built with Tailwind CSS that works seamlessly across desktop and mobile.

## Tech Stack
* **Frontend:** React, Vite, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL, Drizzle ORM

---

## Running the Project Locally

To fork this repository and run CineScribe on your own machine, follow the steps below.

### Prerequisites
You will need to installed on your local machine:
* [Node.js](https://nodejs.org/) 
* [pnpm](https://pnpm.io/installation) 

You will also need to register for free accounts to get the following API keys:
1. A [Neon.tech](https://neon.tech) account 
2. An [OMDB API Key](https://www.omdbapi.com/) 

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/YOUR_GITHUB_USERNAME/CineScribe.git
cd CineScribe
\`\`\`

### 2. Install dependencies
\`\`\`bash
pnpm install
\`\`\`

### 3. Environment Variables
To run this project, you will need to add your own environment variables. Create a `.env` file in the root directory and add the following:

\`\`\`env
# Database
DATABASE_URL="your_neon_postgresql_connection_string"

# APIs
OMDB_API_KEY="your_omdb_api_key"

# Authentication
SESSION_SECRET="generate_any_random_string_here"
\`\`\`

### 4. Push the Database Schema
Before starting the app, push the Drizzle schema to your Neon database to create the necessary tables:
\`\`\`bash
pnpm db:push
\`\`\`

### 5. Start the Development Servers
Because this is a monorepo, you need to start the backend and frontend separately. 

**Terminal 1 (Backend):**
\`\`\`bash
pnpm --filter @workspace/api-server run dev
\`\`\`

**Terminal 2 (Frontend):**
\`\`\`bash
pnpm --filter @workspace/movie-book-review run dev
\`\`\`

The application will now be running at `http://localhost:5173`.
