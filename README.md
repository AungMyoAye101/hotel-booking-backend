# 🏨 Hotel Booking Backend API

 **A robust, fully-featured RESTful API for a modern Hotel Booking platform.** 
 Built with performance, security, and scalability in mind, this backend handles everything from role-based access control and room availability checking to payment processing and automated email receipts.

---

## ✨ Key Features

* **🔐 Authentication & Authorization:** Secure JWT-based authentication using HttpOnly cookies. Implements strict Role-Based Access Control (Admin, Staff, User).
* **🏢 Hotel & Room Management:** Complete CRUD operations with advanced filtering (by destination, price, rating, type) and sorting.
* **📅 Smart Booking System:** Real-time room availability validation, booking creation, and status lifecycles (`DRAFT`, `PENDING`, `CONFIRMED`, `CANCELLED`, `EXPIRED`).
* **💳 Payments & Receipts:** Integration-ready payment tracking (Card, Mobile Banking, Bank) with automated receipt generation.
* **✉️ Automated Emails:** Real-time payment success notifications powered by **Resend**.
* **🖼️ Media Management:** Seamless image uploading and cloud storage via **Cloudinary** and `multer`.
* **📊 Analytics Dashboard:** Revenue tracking, booking statistics, and 6-month performance aggregations for administrators.
* **🧹 Automated Cleanup:** Scheduled cleanup endpoints to purge abandoned drafts and expired pending bookings.
* **🛡️ Bulletproof Security:** Runtime request validation using **Zod**, custom error handling, CORS protection, and rate limiting.
* **🌱 Database Seeding:** Integrated `@faker-js/faker` script to instantly populate the database with realistic mock data.

---

## 🛠️ Tech Stack

* **Core:** Node.js, Express.js, TypeScript
* **Database:** MongoDB, Mongoose ORM
* **Validation:** Zod
* **Media Storage:** Cloudinary
* **Email Service:** Resend
* **Security:** `bcryptjs` (hashing), `jsonwebtoken` (auth), `express-rate-limit`

---

## 📂 Folder Structure

A clean, modular, and scalable architecture separating business logic from route definitions.

```text
hotel-booking-backend/
├── src/
│   ├── common/         # Shared utilities (Custom errors, JWT, passwords, responses)
│   ├── config/         # App configurations & database seeder scripts
│   ├── controller/     # Express route controllers handling request/response
│   ├── middleware/     # Custom middlewares (auth, validation, logging, error handling)
│   ├── models/         # Mongoose database schemas & interfaces
│   ├── routes/         # Express route definitions
│   ├── service/        # Core business logic and database queries
│   ├── types/          # Custom TypeScript definitions
│   ├── utils/          # Helper functions (pagination, date formatting, Resend)
│   ├── validation/     # Zod validation schemas for incoming requests
│   ├── app.ts          # Express application setup & middleware registration
│   └── index.ts        # Server entry point & DB connection
├── .gitignore
├── package.json
└── tsconfig.json
