# SEVA GROUP FOUNDATION - WEBSITE PROJECT BRIEF

## Organisation
Seva Group Foundation - Registered NGO, Noida UP India
Address: Street No.3, Block D, Saraswati Kunj, Chipyana Khurd, Noida Extension, UP 201308
Contact: contact@sevagroupfdn.org | +91 82870 61147
Domain: sevagroupfdn.org

## Tech Stack
- Frontend: Next.js 14 (App Router)
- Styling: Tailwind CSS
- Hosting: Vercel (free tier)
- Database: Firebase Firestore
- Auth: Firebase Phone OTP (users) + Email/Password (admin)
- Media: Cloudinary
- Payments: Razorpay
- Animations: Framer Motion
- Counters: CountUp.js
- Rich Text Editor: TipTap
- PDF: jsPDF + html2canvas

## Brand Identity
- Primary: #1B5E37 (deep forest green)
- Accent: #F5A623 (warm gold/orange)
- Background: #FFFFFF and #F9FBF9 (off-white)
- Text: #1A1A1A
- Style: Glassmorphism cards, Framer Motion scroll animations, mobile-first
- Reference quality: UNICEF.org, Care.org, Akshayapatra.org

## All Pages to Build
1. Home - Hero, impact counters, mission, activities carousel, YouTube embed, donation CTA, social media section, testimonials, partners
2. About Us - Story, vision, team, timeline, 4 children categories
3. Services - 13 service sub-pages (9 original + 4 new categories)
4. Gallery - Filterable masonry grid + lightbox
5. News & Blog - Listing + article with Firestore comments
6. Donations - Razorpay, UPI QR, campaign cards, recurring, child sponsorship tabs
7. Volunteer - /volunteer landing + registration form
8. Sponsor a Child - /sponsor with child profiles + Rs.500/month Razorpay
9. Donate Groceries - /donate-groceries drive schedule + pledge form
10. CSR Partnership - /csr with Silver/Gold/Platinum tiers + proposal form + brochure PDF
11. Legal - 80G cert, registration, annual reports
12. Donor Wall - /donor-wall public donations
13. Contact - WhatsApp primary, email, Google Maps embed

## Services (13 slugs)
Original 9: orphanage, old-age, street-children, education, food-relief, medical-support, tree-plantation, widows, donation
New 4: semi-orphans, accidental-orphans, cancer-family-support, prisoner-family-children

## User Console (mobile OTP login)
- Donation history, downloadable 80G PDF receipts
- Impact certificates, My Sponsorships tab, Profile management

## Admin Console (/admin)
- Login: admin@sevagroupfdn.org
- Sections: Media Manager, Gallery Manager, Blog (TipTap editor)
- Campaign Manager, Donations (CSV export), Volunteer Manager
- Sponsorship Manager, Grocery Drive Manager, CSR Inquiries
- Festival Campaign Calendar, Impact Counter Editor, Settings

## Environment Variables (filled in .env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_SERVICE_ACCOUNT_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GADS_ID=AW-XXXXXXXXXX

## Important Rules
- Never hardcode API keys - always use .env.local
- Mobile-first: test on phone after every component
- Commit after every major feature
- Use picsum.photos for placeholder images during development
- Glassmorphism on all cards using .glass-light and .glass-dark CSS classes
- WhatsApp floating button on every page (wa.me/918287061147)
- All donation amounts in Indian Rupees (Rs./INR)
- Domain is sevagroupfdn.org (not sevagroupfoundation.org)\
