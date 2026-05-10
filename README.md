# Eventora: Event Management System (EMS) - Project Documentation

## 1. Project Overview

**Eventora** is a comprehensive, full-stack Event Management System designed to handle end-to-end event organization, ticketing, and administrative oversight. The platform provides a sleek, high-contrast, modern UI for standard users to discover and book events, and a robust "Analytics Hub" dashboard for administrators to manage inventory, track revenue, and monitor platform health.

The project is built around the modern MERN stack (MongoDB, Express, React, Node.js) and utilizes Vite for blazing-fast frontend development. 

## 2. Technology Stack

### Frontend
- **React.js (v18+)**: Component-based UI library.
- **Vite**: Ultra-fast build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework used for responsive, modern styling (high-contrast, glassmorphism UI).
- **React Router DOM**: Client-side routing.
- **Lucide React**: Modern, consistent icon set.
- **Recharts**: Responsive charts and data visualization for the admin dashboard.

### Backend
- **Node.js**: Server-side runtime environment.
- **Express.js**: Fast, unopinionated web framework for APIs.
- **MongoDB**: NoSQL database for flexible data storage.
- **Mongoose**: Elegant MongoDB object modeling for Node.js.
- **JSON Web Tokens (JWT)**: Secure, stateless authentication.
- **Bcrypt.js**: Password hashing and security.
- **MongoDB Memory Server**: In-memory database fallback ensuring the app runs smoothly even if cloud database connections fail.

---

## 3. Core Features

### User Features (Frontend)
- **Dynamic Homepage**: Features interactive hero sections, automated image slideshows synced with event data, and "Meet the Visionaries" sections.
- **Event Discovery**: Users can browse events across 14 diverse categories (e.g., Business, Entertainment, Virtual, Tech).
- **Real-time Filtering & Search**: Instant filtering by category, status (upcoming, ongoing, completed), and search queries.
- **Seamless Booking**: Users can book tickets, with dynamic seat availability tracking and payment status visualization.
- **User Dashboard**: A personalized portal where users can manage their bookings, view tickets, and update their profile.
- **Responsive Design**: fully optimized for Desktop, Tablet, and Mobile devices.

### Admin Features (Analytics Hub)
- **Centralized Dashboard**: A top-navigation based, scrolling dashboard offering a unified view of platform metrics.
- **Data Visualization**: Real-time charts detailing Monthly Events (Bar Chart) and Events by Category (Pie Chart).
- **KPI Tracking**: Instant snapshots of Total Revenue, Total Active Events, and Paid Bookings vs. Total Bookings.
- **Full CRUD Capabilities**: 
  - Create, Read, Update, and Delete events.
  - Manage user bookings (confirm/cancel).
  - View specific event participant lists dynamically.

---

## 4. File Management & Project Structure

The project follows a standard monorepo structure, neatly separating the frontend application from the backend API services.

```text
college-project-EMS/
│
├── client/                     # Frontend React Application (Vite)
│   ├── public/                 # Static assets (images, icons, etc.)
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, Charts, Modals)
│   │   ├── context/            # React Context providers (AuthContext for global state)
│   │   ├── pages/              # Primary route views (Home, AdminDashboard, Login, Events)
│   │   ├── services/           # API integration layer (Axios wrappers for backend calls)
│   │   ├── utils/              # Helper functions and constants (e.g., categories.js)
│   │   ├── App.jsx             # Root component and Route definitions
│   │   ├── index.css           # Global Tailwind and custom CSS overrides
│   │   └── main.jsx            # React application entry point
│   ├── package.json
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── vite.config.js          # Vite configuration
│
├── server/                     # Backend Node/Express Application
│   ├── controllers/            # Request handlers (auth, events, bookings)
│   ├── middleware/             # Express middlewares (auth verification, error handling)
│   ├── models/                 # Mongoose database schemas (User, Event, Booking)
│   ├── routes/                 # Express API route definitions
│   ├── utils/                  # Backend helpers (emailers, formatters)
│   ├── seed.js                 # Database seeding script (populates demo data)
│   ├── server.js               # Main Express application setup & DB connection
│   └── package.json
│
├── package.json                # Root package.json (manages concurrent scripts)
└── README.md                   # Project instructions
```

### Key Architectural Decisions
- **`client/src/services/`**: Abstracts all external HTTP requests. Components do not call `fetch` or `axios` directly; they call `eventService.getAll()` keeping UI components clean.
- **`server/seed.js`**: Contains extensive mock data (users, 14 categories of events, randomized bookings) and handles robust connection logic (including public DNS resolvers for MongoDB Atlas).

---

## 5. Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local installation OR MongoDB Atlas URI)

### Step 1: Clone and Install Dependencies
Navigate to the root directory and run the global setup script. This will install dependencies for both the `client` and `server` folders automatically.
```bash
npm run setup
```

### Step 2: Environment Configuration
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/eventora
JWT_SECRET=your_super_secret_jwt_key
```

### Step 3: Seed the Database (Optional but Recommended)
To populate the database with demo users, 18 diverse events, and randomized bookings:
```bash
cd server
npm run seed
```
*Note: The seeded Admin credentials are `admin@eventora.com` / `password123`.*

### Step 4: Run the Application
From the root directory, start both the frontend and backend concurrently:
```bash
npm run dev
```
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## 6. Core API Endpoints

### Auth (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Authenticate user & return JWT
- `GET /me` - Get current logged-in user details

### Events (`/api/events`)
- `GET /` - Retrieve all active events
- `GET /:id` - Retrieve specific event details
- `POST /` - Create a new event (Admin only)
- `PUT /:id` - Update an event (Admin only)
- `DELETE /:id` - Delete an event (Admin only)

### Bookings (`/api/bookings`)
- `GET /` - Get all bookings (Admin) or user-specific bookings
- `POST /` - Create a new ticket booking
- `PUT /:id/confirm` - Confirm payment/booking status (Admin)
- `DELETE /:id` - Cancel a booking

---

## 7. Known Fallbacks & Safeguards
- **In-Memory Database**: If the provided `MONGO_URI` fails to connect (e.g., due to strict firewall rules or bad DNS), `server.js` will automatically spin up an isolated `mongodb-memory-server` and run the `seed.js` script so the application can still be demoed seamlessly.
