# Seva Group Foundation — Official Website

Registered NGO | Noida, UP, India | [sevagroupfdn.org](https://sevagroupfdn.org)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 + Glassmorphism |
| Animations | Framer Motion |
| Database | Firebase Firestore |
| Auth | Firebase Phone OTP (users) / Email+Password (admin) |
| Media | Cloudinary |
| Payments | Razorpay |
| Hosting | Vercel (free tier) |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file at the project root:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Admin SDK JSON (stringified) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Webhook Secret |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID |
| `NEXT_PUBLIC_GADS_ID` | Google Ads Conversion ID |

## Project Structure

```
src/
  app/
    (public)/          # Public-facing pages (Navbar + Footer layout)
    (auth)/login/      # Phone OTP login
    (dashboard)/       # Donor dashboard
    admin/             # Admin console (/admin)
    api/               # API routes (donations, auth, media, blog, csr)
  components/
    ui/                # Reusable UI primitives
    layout/            # Navbar, Footer, WhatsApp FAB
    home/              # Home page sections
    admin/             # Admin UI components
    dashboard/         # Donor dashboard components
  lib/                 # Firebase, Cloudinary, Razorpay, utils, auth context
  constants/           # SERVICES, CHILDREN, NAV_LINKS, SOCIAL_LINKS, IMPACT_STATS
  types/               # TypeScript interfaces
  styles/              # glass.css (glassmorphism utility classes)
```

## Brand

- **Primary:** `#1B5E37` (deep forest green)
- **Accent:** `#F5A623` (warm gold)
- **Background:** `#F9FBF9`
- **Fonts:** Inter (body) + Playfair Display (headings)

## Contact

- Email: contact@sevagroupfdn.org
- WhatsApp: +91 82870 61147
- Address: Street No.3, Block D, Saraswati Kunj, Chipyana Khurd, Noida Extension, UP 201308
