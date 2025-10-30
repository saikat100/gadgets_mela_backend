# Gadgets Mela Backend

A Node.js/Express backend for Gadgets Mela:
- MongoDB Atlas for storage (users, orders, products)
- Stripe for payment processing
- ImgBB for product image hosting
- JWT+Passport.js authentication
- Helmet, CORS, rate limiting, validation

## Setup

1. Clone the repo and run:
   ```bash
   npm install
   cp .env.example .env # then fill in .env
   ```

2. Start for development:
   ```bash
   npm run dev
   ```
   Production:
   ```bash
   npm start
   ```

## Project Structure

```
.
├── src
│   ├── config        # ENV & DB config
│   ├── controllers   # API logic per route
│   ├── middlewares   # custom, JWT, Passport, security
│   ├── models        # Mongoose schemas
│   ├── routes        # API routes
│   ├── services      # Stripe, ImgBB, etc.
│   ├── utils         # helpers
│   └── app.js        # Express app
├── server.js         # Entrypoint (loads .env, executes app)
├── .env.example      # Example env vars
├── package.json      # Dependencies & scripts
└── README.md
```

• All endpoints are versioned at `/api/`
• MongoDB Atlas manages persistence; Stripe handles payments; ImgBB is used for image uploads.
