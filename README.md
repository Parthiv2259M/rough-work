# StayCastle

A production-style hotel booking web application built with Next.js, Tailwind CSS, and a secure checkout-ready payment layer. The app includes property listings, dynamic pricing, destination maps, and a polished booking flow designed for modern travel brands.

## Features

- Hotel discovery with filter-friendly landing page
- Property detail pages with gallery and map integration
- Booking flow and summary cards
- Stripe-ready payment module in test mode
- Admin dashboard for bookings and performance metrics
- Public API routes for hotel data and health checks
- Responsive design for desktop and mobile
- Test coverage targeting 95% on critical logic and routes

## Stack

- Next.js 14
- React 18
- Tailwind CSS
- Vitest for unit and route testing
- Lucide React icons
- Stripe SDK integration stub

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Production deployment

Recommended host: Vercel

```bash
npm run build
npm run start
```

Set the following environment variables in Vercel or your deployment environment:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Testing

```bash
npm run test:coverage
```

This project targets 95% global coverage for the logic and API modules.

## Notes

This app uses open public imagery and open map tiles for a free, demo-ready experience. For live production checkout, enable your own Stripe keys and map credentials.
