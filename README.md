# ShareHub — Neighborhood Tool & Equipment Sharing

A full-stack marketplace where neighbors can list, rent, and return tools and equipment, with secure payments, security deposits, and QR-code-based pickup/return verification.

**Live demo:** https://sharehub-opal.vercel.app

## Overview

ShareHub lets an **Owner** list a tool with a daily rental price and a security deposit, and a **Borrower** book it for a date range, pay rental + deposit together via Stripe, pick it up after the owner scans a QR code, and return it the same way — with the owner inspecting for damage and the borrower's deposit refunded (minus any damage amount).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcrypt |
| Payments | Stripe (Payment Intents) |
| Image Storage | Cloudinary |
| QR | `qrcode` (generation), `html5-qrcode` (camera scanning) |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |

## Core Flow

```
Owner lists tool → sets price + deposit + availability
        ↓
Borrower selects dates → books tool (date-overlap checked)
        ↓
Borrower pays rental + deposit via Stripe
        ↓
Borrower generates pickup QR → Owner scans → pickup confirmed
        ↓
Rental period (booking status: active)
        ↓
Borrower generates return QR → Owner scans → damage inspection
        ↓
Deposit refunded in full, or damage amount deducted
```

## Features

- JWT authentication with protected routes
- Tool listing with multi-image upload (Cloudinary)
- Date-range availability and booking-overlap validation
- Stripe payment intents covering rental amount + security deposit in a single charge
- Server-side payment verification before confirming a booking (never trusts the client)
- JWT-signed, time-limited QR codes for pickup and return, scoped to one booking and one action
- Camera-based QR scanning (owner side) using the device camera
- Damage reporting on return with automatic refund calculation

## Project Structure

```
sharehub/
  backend/
    config/       → DB, Cloudinary, Stripe, Multer setup
    controllers/   → auth, tool, booking logic
    middleware/    → JWT auth middleware
    models/        → User, Tool, Booking schemas
    routes/
  frontend/
    src/
      app/         → Next.js pages (App Router)
      components/  → Navbar, ToolCard, CheckoutForm, QRScanner, etc.
      lib/         → Axios instance, Stripe loader
```

## Running Locally

**Backend**
```
cd backend
npm install
npm run dev
```

Create `backend/.env`:
```
PORT=5000
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
```

**Frontend**
```
cd frontend
npm install
npm run dev
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Deployment

- Backend deployed on Render (Node web service)
- Frontend deployed on Vercel (Next.js, root directory: `frontend`)
- Database hosted on MongoDB Atlas
- Stripe running in test mode