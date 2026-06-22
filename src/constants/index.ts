export const SERVICES = [
  {
    slug: "orphanage",
    title: "Orphanage Care",
    description:
      "Providing a safe home, nutritious meals, education, and emotional support for children who have lost both parents.",
    icon: "Home",
  },
  {
    slug: "old-age",
    title: "Old Age Home",
    description:
      "Dignified shelter, healthcare, and companionship for elderly individuals abandoned or without family support.",
    icon: "Users",
  },
  {
    slug: "street-children",
    title: "Street Children",
    description:
      "Rescuing, rehabilitating, and reintegrating children living on the streets into safe environments with education.",
    icon: "Heart",
  },
  {
    slug: "education",
    title: "Education Support",
    description:
      "Scholarships, school supplies, tutoring, and digital literacy programs for underprivileged children.",
    icon: "BookOpen",
  },
  {
    slug: "food-relief",
    title: "Food Relief",
    description:
      "Daily meals, ration kits, and community kitchens ensuring no child or family sleeps hungry.",
    icon: "Utensils",
  },
  {
    slug: "medical-support",
    title: "Medical Support",
    description:
      "Free health camps, medicines, doctor consultations, and emergency medical assistance for vulnerable communities.",
    icon: "Stethoscope",
  },
  {
    slug: "tree-plantation",
    title: "Tree Plantation",
    description:
      "Environmental initiative planting trees across Noida to build a greener, cleaner future for coming generations.",
    icon: "TreePine",
  },
  {
    slug: "widows",
    title: "Widow Support",
    description:
      "Financial aid, skill development, legal guidance, and emotional counselling for widows rebuilding their lives.",
    icon: "UserCheck",
  },
  {
    slug: "donation",
    title: "General Donations",
    description:
      "Your contribution funds all our programs — from meals to medical camps — helping us reach more lives every day.",
    icon: "Gift",
  },
  {
    slug: "semi-orphans",
    title: "Semi-Orphan Support",
    description:
      "Holistic care for children who have lost one parent, helping the surviving parent sustain the family with dignity.",
    icon: "HeartHandshake",
  },
  {
    slug: "accidental-orphans",
    title: "Accidental Orphan Care",
    description:
      "Emergency support and long-term rehabilitation for children suddenly orphaned due to accidents or disasters.",
    icon: "Shield",
  },
  {
    slug: "cancer-family-support",
    title: "Cancer Family Support",
    description:
      "Financial relief, counselling, and care for children and families devastated by a cancer diagnosis.",
    icon: "Ribbon",
  },
  {
    slug: "prisoner-family-children",
    title: "Prisoner Family Children",
    description:
      "Education, nutrition, and emotional support for children whose parents are incarcerated — breaking the cycle.",
    icon: "Lock",
  },
] as const;

export const CHILDREN = [
  {
    id: "1",
    name: "Riya Sharma",
    age: 8,
    category: "orphan",
    story:
      "Riya lost both her parents in a road accident two years ago. She loves drawing and dreams of becoming a teacher.",
    imageSeed: 237,
    isSponsored: false,
  },
  {
    id: "2",
    name: "Arjun Kumar",
    age: 10,
    category: "semi-orphan",
    story:
      "Arjun's father passed away from illness, leaving his mother to raise three children alone. He is bright in mathematics.",
    imageSeed: 452,
    isSponsored: true,
  },
  {
    id: "3",
    name: "Priya Devi",
    age: 7,
    category: "street-children",
    story:
      "Rescued from the streets of Noida Extension, Priya is now learning to read and has a contagious smile.",
    imageSeed: 119,
    isSponsored: false,
  },
  {
    id: "4",
    name: "Rahul Singh",
    age: 12,
    category: "prisoner-family",
    story:
      "Rahul's father is serving a sentence. He is determined to study and support his mother and younger siblings.",
    imageSeed: 334,
    isSponsored: false,
  },
  {
    id: "5",
    name: "Ananya Gupta",
    age: 9,
    category: "cancer-family",
    story:
      "Ananya's mother is battling cancer. She cooks for her siblings every evening after school while staying top of her class.",
    imageSeed: 78,
    isSponsored: true,
  },
  {
    id: "6",
    name: "Mohit Verma",
    age: 11,
    category: "accidental-orphan",
    story:
      "Mohit lost both parents in a factory fire. He is now in our care and has a talent for cricket and storytelling.",
    imageSeed: 561,
    isSponsored: false,
  },
  {
    id: "7",
    name: "Sunita Yadav",
    age: 6,
    category: "orphan",
    story:
      "Sunita arrived at our shelter malnourished and afraid. Today she is healthy, playful, and learning her alphabets.",
    imageSeed: 203,
    isSponsored: false,
  },
  {
    id: "8",
    name: "Deepak Patel",
    age: 13,
    category: "semi-orphan",
    story:
      "Deepak wants to become an engineer. With a sponsorship, he can stay in school and pursue his dream full-time.",
    imageSeed: 417,
    isSponsored: false,
  },
] as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services/orphanage" },
  { label: "Gallery", href: "/gallery" },
  { label: "News", href: "/news" },
  { label: "Donate", href: "/donations" },
  { label: "Volunteer", href: "/volunteer" },
  { label: "Sponsor a Child", href: "/sponsor" },
  { label: "Contact", href: "/contact" },
] as const;

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/sevagroupfdn",
  instagram: "https://www.instagram.com/sevagroupfdn",
  twitter: "https://twitter.com/sevagroupfdn",
  youtube: "https://www.youtube.com/@sevagroupfdn",
  linkedin: "https://www.linkedin.com/company/seva-group-foundation",
} as const;

export const IMPACT_STATS = {
  children: 840,
  meals: 8400,
  camps: 50,
  trees: 500,
} as const;

export const WHATSAPP_NUMBER = "918287061147";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export const ORG = {
  name: "Seva Group Foundation",
  email: "contact@sevagroupfdn.org",
  phone: "+91 82870 61147",
  address: "Street No.3, Block D, Saraswati Kunj, Chipyana Khurd, Noida Extension, UP 201308",
  domain: "sevagroupfdn.org",
  website: "https://sevagroupfdn.org",
  adminEmail: "admin@sevagroupfdn.org",
  sponsorshipAmount: 500,
} as const;
