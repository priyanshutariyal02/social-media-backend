# Social Media Backend Service

This repository contains the backend service for a social media application, built using Node.js, Express.js, and MongoDB.  It provides core functionalities for user authentication, profile and post management, leveraging Cloudinary for media storage and various middleware for request handling and security.

## Key Features

* **User Authentication:** Secure sign-up, login, logout, and session management using access and refresh tokens.
* **Profile Management:**  Users can update their profile information and upload profile pictures.
* **Post Management:**  Create, read, update, and delete posts, including image uploads.
* **Data Operations:** Comprehensive CRUD operations for user and post data.
* **Data Aggregation:** MongoDB aggregation pipelines for fetching user feeds and analytics.

## Technologies Used

* **Node.js:** JavaScript runtime environment.
* **Express.js:** Web application framework.
* **MongoDB:** NoSQL database.
* **Cloudinary:** Cloud-based media management.
* **Multer:** Middleware for handling multipart/form-data (file uploads).
* **Bcrypt:** Password hashing library.
* **Axios:** HTTP client (for testing).
* **CORS:** Middleware for Cross-Origin Resource Sharing.
* **Nodemon:** Development tool for server auto-restart.
* **Prettier:** Code formatter.
* **GitHub:** Version control.

## Model Design

![diagram-export-2-10-2025-1_10_38-PM](https://github.com/user-attachments/assets/7eb89849-1096-49f1-8def-ae1a82e22b12)

## Architecture

The backend follows a modular architecture, separating concerns into distinct routes and middleware.  Key components include:

* **Authentication:** Handles user registration, login, and token management.
* **Profile:** Manages user profile information and updates.
* **Post:** Handles post creation, retrieval, updates, and deletion.
* **Middleware:** Implements authentication, file uploads, CORS, and error handling.
* **Database:** MongoDB stores user and post data.
* **Storage:** Cloudinary handles media storage and transformations.

## Functionality Breakdown

### User Management

* **Sign Up:**  Registers new users with email, password, and profile details.  Passwords are securely hashed using bcrypt.
* **Login:** Authenticates existing users and issues access and refresh tokens.
* **Tokens:**
    * **Access Token:** Authorizes API requests.
    * **Refresh Token:** Used to obtain new access tokens.

### Profile & Post Management

* **Profile Management:** Users can update profile information and upload profile pictures via Cloudinary.
* **Post CRUD Operations:** Create, read, update, and delete posts. Image attachments are handled by Multer and stored in Cloudinary.
* **Data Aggregation:** MongoDB aggregation pipelines are used to retrieve user feeds, post analytics, and user engagement statistics.

### Middleware & Error Handling

* **Authentication Middleware:** Protects routes requiring authentication by verifying access tokens.  Handles refresh token requests.
* **Multer Middleware:** Handles multipart/form-data for file uploads.
* **CORS Middleware:** Enables cross-origin requests.
* **Error Handling:** Centralized error handling for consistent API responses.

### Routing

* **Express Routers:** Organizes routes for user management, profiles, and posts.
* **Protected Routes:** Requires authentication and authorization.

### API Documentation

Postman is used for API documentation and testing.  (Link to Postman collection or instructions on how to import it would be beneficial here).

### Data Modeling

* **User Schema:** Defines user properties (name, email, password hash, profile picture URL, etc.).
* **Post Schema:** Stores post details (content, images, timestamps, author references).

## Getting Started

### Prerequisites

* Node.js (v16 or higher recommended)
* MongoDB (running instance)
* Cloudinary Account (with API keys)

### Installation

1. Clone the repository: `git clone <repository_url>`
2. Install dependencies: `npm install`
3. Configure environment variables: Create a `.env` file in the root directory and add the following (replace with your actual values):
