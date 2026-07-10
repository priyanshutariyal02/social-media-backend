# Playtube - Full-Stack Video & Social Media Streaming Platform

A production-ready, full-stack video broadcasting and social engagement platform built with modern web architecture. Featuring high-definition video streaming, creator studio analytics, interactive community tweets, hierarchical nested commenting, and real-time search capabilities.

---

## Key Features

### Frontend (Client Application)
* **Vibrant & Dynamic UI:** Built with **React 18**, **TypeScript**, and **Vite**, styled with custom sleek dark mode aesthetics using **TailwindCSS**.
* **Optimized State & Caching:** Powered by **TanStack Query (React Query)** for lightning-fast API responses, automatic background data refetching, and optimistic UI updates.
* **Live Instant Stream Search:** Real-time search bar dropdown in the navigation bar that queries matching videos and community posts as you type.
* **Interactive Video Player:** Dedicated watch screen (`/watch/:videoId`) featuring dynamic view counters, subscriber tracking, like toggling, and nested discussion threads.
* **Creator Studio Dashboard:** Dedicated management hub (`/dashboard`) for creators to track channel analytics (views, likes, subscribers), publish new video broadcasts, toggle visibility, and edit existing media.
* **Creator Stream & Tweets:** Twitter-style social community stream (`/tweets`) with nested reply drawers for interactive creator-fan discussions.

### Backend (API Service)
* **Secure Authentication & Authorization:** JWT-based stateless access and refresh token rotation with secure HTTP-only cookie support and bcrypt password hashing.
* **Cloud Media Pipeline:** Seamless multipart file uploads via **Multer** integrated with **Cloudinary** for scalable cloud video streaming and image optimization.
* **Complex MongoDB Aggregation Pipelines:** Advanced data aggregation for calculating subscriber counts, watch history, video like metrics, and nested comment structures.
* **Hierarchical Discussion System:** Unified `Comment` schema supporting both top-level comments and multi-level nested replies on videos and tweets.
* **Resilient CORS & Security:** Production-configured CORS allowing cross-origin requests from Vercel frontends with credential support.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, TanStack Query (v5), React Router DOM, Lucide Icons, Axios |
| **Backend** | Node.js (ESM), Express.js, MongoDB Atlas, Mongoose, Cloudinary SDK, Multer, JSON Web Tokens (JWT), Bcrypt |
| **Deployment** | Vercel (Frontend SPA & CDN), Render / Cloud Containers (Node/Express API Service) |

---

## Database Model & Architecture

![Model Design](https://github.com/user-attachments/assets/7eb89849-1096-49f1-8def-ae1a82e22b12)

The backend follows a clean MVC modular architecture separated into distinct routes, controllers, models, and custom middlewares:
* **`User` Schema:** Handles authentication details, channel cover images, avatars, and watch history.
* **`Video` Schema:** Stores streaming file URLs, duration, thumbnails, views, publication status, and owner references.
* **`Tweet` Schema:** Stores community text broadcasts and creator posts.
* **`Comment` Schema:** Hierarchical document structure linking to either a `Video` or `Tweet` with a `parentComment` pointer for nested replies.
* **`Like` & `Subscription` Schemas:** Relational mapping documents tracking likes across videos/comments/tweets and user-to-user subscriptions.

---

## Project Structure

```text
social-media-backend/
├── backend/                  # Node.js + Express API Server
│   ├── src/
│   │   ├── controllers/      # Route controllers (auth, videos, comments, dashboard, etc.)
│   │   ├── db/               # MongoDB Atlas connection handler
│   │   ├── middlewares/      # Auth verification & Multer file upload middlewares
│   │   ├── models/           # Mongoose schemas (User, Video, Tweet, Comment, Like, etc.)
│   │   ├── routes/           # REST API routes v1
│   │   └── utils/            # Cloudinary uploader, ApiError & ApiResponse handlers
│   └── package.json
│
└── frontend/                 # React + TypeScript + Vite SPA
    ├── src/
    │   ├── api/              # Axios client with JWT interceptors & token rotation
    │   ├── components/       # Reusable UI components (Navbar, Sidebar, VideoCard, etc.)
    │   ├── context/          # Global AuthContext provider
    │   ├── pages/            # Application screens (Home, WatchVideo, Tweets, Dashboard, Auth)
    │   └── types/            # TypeScript interfaces
    ├── vercel.json           # SPA rewrite configuration for Vercel deployment
    └── package.json
```

---

## Getting Started Locally

### 1. Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB Atlas** or Local MongoDB instance
* **Cloudinary Account** (for video and thumbnail storage)

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `/backend`:
```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_super_secret_access_token_key
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal session:
```bash
cd frontend
npm install
```

Create a `.env` file inside `/frontend`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Start the Vite development server:
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser to experience Playtube locally!

---

## Production Deployment Guide

* **Frontend (Vercel):** Deployed effortlessly with automated client-side route handling via `vercel.json`. Configure environment variable `VITE_API_BASE_URL` pointing to your live backend domain.
* **Backend (Render):** Running on a dedicated Node container (`npm start`) to guarantee unrestricted payload streaming for large video file uploads to Cloudinary without serverless execution timeouts.

---

## License
Designed and developed by [Priyanshu Tariyal](https://github.com/priyanshutariyal02).
