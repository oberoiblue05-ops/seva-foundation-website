export interface PlaceholderPost {
  slug:       string;
  title:      string;
  excerpt:    string;
  category:   string;
  date:       string;
  author:     string;
  coverSeed:  string;
  readTime:   string;
  tags:       string[];
}

export const BLOG_POSTS: PlaceholderPost[] = [
  {
    slug:      "food-camp-december-2024",
    title:     "500 Families Fed at Our December Food Camp",
    excerpt:   "Our biggest food distribution event of the year brought warmth and nutrition to 500 families across Noida Extension just days before Christmas.",
    category:  "Food Relief",
    date:      "December 15, 2024",
    author:    "Priya Verma",
    coverSeed: "blog-food",
    readTime:  "3 min read",
    tags:      ["food", "camp", "community"],
  },
  {
    slug:      "digital-literacy-launch-2024",
    title:     "Our Digital Literacy Programme Reaches 200 Children",
    excerpt:   "Partnering with a CSR donor, we launched a 10-computer lab that is now teaching coding basics and internet safety to 200 underprivileged kids.",
    category:  "Education",
    date:      "November 8, 2024",
    author:    "Amit Singh",
    coverSeed: "blog-edu",
    readTime:  "4 min read",
    tags:      ["education", "technology", "csr"],
  },
  {
    slug:      "tree-plantation-independence-day-2024",
    title:     "200 Saplings Planted on Independence Day",
    excerpt:   "Volunteers from across NCR gathered at three locations in Noida Extension to plant 200 native saplings as a pledge to Green India.",
    category:  "Environment",
    date:      "August 15, 2024",
    author:    "Rajesh Sharma",
    coverSeed: "blog-tree",
    readTime:  "2 min read",
    tags:      ["environment", "trees", "independence-day"],
  },
  {
    slug:      "eye-camp-medical-march-2024",
    title:     "Free Eye Camp Serves 300 Patients in One Day",
    excerpt:   "With two ophthalmologists volunteering their Sunday, we ran our largest eye camp ever — distributing 80 free spectacles and referring 12 patients for surgery.",
    category:  "Medical Camp",
    date:      "March 22, 2024",
    author:    "Sunita Gupta",
    coverSeed: "blog-eye",
    readTime:  "3 min read",
    tags:      ["health", "camp", "vision"],
  },
  {
    slug:      "sponsorship-50-children-2023",
    title:     "50 New Children Find Sponsors in 2023",
    excerpt:   "Through our child sponsorship programme, 50 more children now have monthly support covering meals, school fees, and medical care — thanks to donors across India.",
    category:  "Child Welfare",
    date:      "December 30, 2023",
    author:    "Priya Verma",
    coverSeed: "blog-sponsor",
    readTime:  "5 min read",
    tags:      ["sponsorship", "children", "impact"],
  },
  {
    slug:      "csr-partnership-techcorp-2023",
    title:     "CSR Partnership Brings Rs. 5 Lakh to Education Fund",
    excerpt:   "A Gold-tier CSR partnership with a leading IT company has added Rs. 5 lakh to our education fund — enough to support 100 children for an entire academic year.",
    category:  "CSR",
    date:      "September 5, 2023",
    author:    "Amit Singh",
    coverSeed: "blog-csr",
    readTime:  "4 min read",
    tags:      ["csr", "partnership", "education"],
  },
];
