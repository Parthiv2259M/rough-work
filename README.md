# StayCastle - Production Hotel Booking App

A full-stack hotel booking platform built with Next.js 14, Stripe payments, Prisma ORM, and NextAuth authentication.

## Features

### Core Booking
- Hotel discovery with smart search and filtering
- Dynamic pricing with occupancy-based calculations
- Promo code support (SAVE10 for 10% discount)
- Real-time Stripe checkout integration
- Booking confirmation and cancellation flows

### Authentication
- NextAuth with email credentials
- Session management
- User dashboard with booking history
- Protected routes

### Database
- PostgreSQL with Prisma ORM
- User accounts and sessions
- Booking records with pricing breakdown
- Payment logs and webhook tracking

### Payment Processing
- Stripe checkout sessions
- Webhook event handling
- Payment success/failure tracking
- Tax and service fee calculations

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Payments**: Stripe
- **Testing**: Vitest + Testing Library

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account (get free test keys)

### Installation

```bash
git clone <repo-url>
cd hotel-booking-app
npm install

# Setup environment variables
cp .env.example .env.local

# Update .env.local with your actual values

# Initialize database
npm run db:push

# Start development server
npm run dev
```

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hotel_booking"

# Stripe (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# NextAuth
NEXTAUTH_SECRET=generate-random-secret
NEXTAUTH_URL=http://localhost:3000

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

## Usage

### Local Development

```bash
# Start dev server
npm run dev
# Open http://localhost:3000

# View database
npm run db:studio

# Run tests
npm run test:coverage
```

### Stripe Testing

Use these test card numbers:
- `4242 4242 4242 4242` - Successful payment
- `4000 0000 0000 0002` - Declined card
- `4000 0025 0000 3155` - 3D Secure required

Test webhook events:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on Vercel
3. Add environment variables
4. Deploy

```bash
vercel --prod
```

### Railway / Render

1. Connect repository
2. Set environment variables
3. Deploy with `npm run build && npm run start`

## API Routes

- `GET /api/health` - Service status
- `GET /api/hotels` - List hotels
- `POST /api/bookings` - Create booking (auth required)
- `GET /api/bookings` - Get user bookings (auth required)
- `POST /api/webhooks/stripe` - Stripe webhook events

## Database Schema

- **User** - User accounts with sessions
- **Booking** - Hotel bookings with pricing details
- **PaymentLog** - Payment event history

## Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage (target: 95%)
npm run test:coverage
```

## Architecture

```
app/
  ├── api/              API routes (bookings, webhooks)
  ├── auth/             Authentication pages
  ├── booking/          Booking flow & success/cancel
  ├── dashboard/        User dashboard
  ├── hotel/            Hotel detail page
  ├── hotels/           Hotel listing with filters
  └── page.tsx          Landing page

lib/
  ├── auth.ts           NextAuth config
  ├── booking.ts        Booking logic & validation
  ├── db.ts             Prisma client
  ├── hotel.ts          Hotel utilities
  └── stripe.ts         Stripe integration

prisma/
  └── schema.prisma     Database schema

tests/
  ├── api.test.ts       API tests
  └── booking.test.ts   Booking logic tests
```

## Production Checklist

- [ ] Set up PostgreSQL database (Railway, Supabase, or similar)
- [ ] Configure Stripe production keys
- [ ] Set up webhook secret in Stripe dashboard
- [ ] Enable HTTPS
- [ ] Set proper NEXTAUTH_SECRET
- [ ] Configure CORS and security headers
- [ ] Enable database backups
- [ ] Set up error logging (Sentry)
- [ ] Configure email service for confirmations
- [ ] Run test coverage checks
- [ ] Load test booking flow

## Troubleshooting

### Database connection issues
```bash
# Reset database
npm run db:push -- --force-reset
```

### Stripe webhook not receiving events
```bash
# Check webhook endpoint in Stripe dashboard
# Ensure STRIPE_WEBHOOK_SECRET is set correctly
```

### Session not persisting
```bash
# Clear cookies and sign in again
# Check NEXTAUTH_SECRET is set
```

## Support

For issues or questions, please create an issue on GitHub.

## License

MIT
