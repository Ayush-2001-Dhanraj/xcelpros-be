# 🛠️ Meal Calorie REST API

A robust Node.js backend service built with Express.js and MongoDB (Mongoose) to handle user authentication and provide nutritional data by integrating with the **USDA FoodData Central API**. This service is designed as part of an assignment.

---

## Features

* **Secure User Authentication:**
    * **Registration** (`/auth/register`), **Login** (`/auth/login`), and **Logout** (`/auth/logout`) functionality.
    * Uses **JWT (JSON Web Tokens)** stored in secure, signed HTTP-only cookies (`accessToken` and `refreshToken`).
    * Passwords are encrypted using **bcryptjs**.
* **User Management:**
    * View current user details (`/user/showMe`).
    * Update user profile (Name, Email) (`/user/updateUser`).
    * Secure password update feature (`/user/updateUserPassword`).
* **Nutritional Data API Integration:**
    * **Search for Dishes** (`/food/search`): Provides a list of matching food items from the USDA database.
    * **Calculate Calories & Nutrients** (`/food/get-calorie`): Finds the best matching food item and returns detailed calorie counts and micronutrient breakdown for a specified number of servings.
* **Security & Best Practices:**
    * **Rate Limiting** implemented using `express-rate-limit` to prevent abuse.
    * **Security Headers** via `helmet`.
    * **XSS Protection** via `xss-clean` for input sanitization.
    * CORS configured for specified origins.
    * Asynchronous error handling with `express-async-errors`.

---

## Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | Node.js, Express.js | Core Server Framework |
| **Database** | MongoDB, Mongoose | NoSQL Database and ODM |
| **Auth** | JWT, bcryptjs | Secure Authentication and Hashing |
| **Security** | Helmet, xss-clean, Rate-Limiter | Application Security and DOS Protection |
| **API Client** | axios | HTTP Client for USDA API Integration |
| **Utils** | dotenv, http-status-codes | Environment Variables and Status Code Management |

---

## Installation and Setup

### Prerequisites

* Node.js (LTS recommended)
* MongoDB Instance (Local or Hosted)

### Configure Environment Variables:

    Create a file named **`.env`** in the root directory and populate it with your configuration values.

    ```bash
    # .env example
    JWT_SECRET=your_jwt_signing_secret_here
    PORT=5000
    NODE_ENV=development
    MONGO_URL=mongodb://localhost:27017/nutridb
    USDA_BASE_URL=[https://api.nal.usda.gov/fdc/v1/foods/search](https://api.nal.usda.gov/fdc/v1/foods/search)
    USDA_API_KEY=YOUR_USDA_FOODDATA_CENTRAL_API_KEY
    RATE_LIMIT_MAX=15
    RATE_LIMIT_WINDOW_MS=60000 # 1 minute
    CORS_ORIGIN=http://localhost:3000
    ```



## API Endpoints

All endpoints are prefixed with the base URL (e.g., `http://localhost:5000`).

### Authentication (`/auth`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Create a new user account. | Public |
| `POST` | `/auth/login` | Log in and receive access/refresh tokens. | Public |
| `GET` | `/auth/logout` | Clear tokens and log the user out. | Public |

### User Management (`/user`) - Requires Authentication

| Method | Endpoint | Description | Body Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/user/showMe` | Get the details of the currently authenticated user. | N/A |
| `PATCH`| `/user/updateUser` | Update user name and email. | `{ "name", "email" }` |
| `PATCH`| `/user/updateUserPassword` | Update the user's password. | `{ "oldPassword", "newPassword" }` |

### Food and Nutrition (`/food`)

| Method | Endpoint | Description | Query/Body Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/food/search` | Search for food items by name. | `?query=chicken` |
| `POST`| `/food/get-calories` | Get detailed nutrient info for a dish. | `{ "dish_name", "servings" (optional) }` |

---

## Project Structure (Screenshot)
![Screenshot 2025-10-19 162428](https://github.com/user-attachments/assets/d915e6fd-626c-4f13-bd09-3e5245c034a1)
