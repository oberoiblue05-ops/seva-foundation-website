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
    name: "Aarav",
    age: 9,
    category: "orphan",
    story:
      "Lost both parents in floods near Noida Extension. Loves cricket and dreams of becoming an engineer one day.",
    imageSeed: 301,
    isSponsored: false,
  },
  {
    id: "2",
    name: "Priya",
    age: 7,
    category: "orphan",
    story:
      "Found near Noida railway station last year. Priya is learning to read and her smile lights up our shelter every morning.",
    imageSeed: 142,
    isSponsored: true,
  },
  {
    id: "3",
    name: "Rahul",
    age: 12,
    category: "semi-orphan",
    story:
      "His father died in a construction accident. Rahul is top of his class and quietly helps his mother after school every day.",
    imageSeed: 89,
    isSponsored: false,
  },
  {
    id: "4",
    name: "Kavya",
    age: 8,
    category: "flood-affected",
    story:
      "The Yamuna flood destroyed her family's home. Kavya draws pictures of the old house and dreams of rebuilding it someday.",
    imageSeed: 527,
    isSponsored: false,
  },
  {
    id: "5",
    name: "Arjun",
    age: 10,
    category: "semi-orphan",
    story:
      "His mother passed after a long illness last year. Arjun cares for his younger sister and excels in mathematics at school.",
    imageSeed: 376,
    isSponsored: false,
  },
  {
    id: "6",
    name: "Meera",
    age: 11,
    category: "accident-family",
    story:
      "Her father was paralysed in a road accident. Meera manages household chores every day and tops her class in science.",
    imageSeed: 215,
    isSponsored: false,
  },
  {
    id: "7",
    name: "Rohan",
    age: 13,
    category: "cancer-family",
    story:
      "His mother is undergoing chemotherapy. Rohan cooks for his siblings every night and has not missed a day of school.",
    imageSeed: 643,
    isSponsored: false,
  },
  {
    id: "8",
    name: "Sunita",
    age: 7,
    category: "flood-affected",
    story:
      "Displaced by flooding in Noida Extension last monsoon. Sunita loves dancing and has just started learning the alphabet.",
    imageSeed: 490,
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
