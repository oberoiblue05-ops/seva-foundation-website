export interface Donation {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  amount: number;
  currency: "INR";
  purpose: string;
  campaignId?: string;
  childId?: string;
  isRecurring: boolean;
  status: "pending" | "captured" | "failed" | "refunded";
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  receipt80G?: string;
  createdAt: Date | string;
  isAnonymous: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  goal: number;
  raised: number;
  imageUrl: string;
  endDate: Date | string;
  isActive: boolean;
  isFeatured: boolean;
  category: string;
  createdAt: Date | string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorName: string;
  authorPhoto?: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  views: number;
}

export interface BlogComment {
  id: string;
  postId: string;
  userId: string;
  name: string;
  content: string;
  createdAt: Date | string;
  isApproved: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  order: number;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  tags: string[];
  date: Date | string;
  isPublished: boolean;
  cloudinaryPublicId: string;
}

export interface ImpactStat {
  children: number;
  meals: number;
  camps: number;
  trees: number;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  skills: string[];
  availability: "weekdays" | "weekends" | "both";
  motivation: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date | string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  category: "orphan" | "semi-orphan" | "accidental-orphan" | "street-children" | "cancer-family" | "prisoner-family";
  story: string;
  imageSeed: number;
  isSponsored: boolean;
  sponsorId?: string;
}

export interface Sponsorship {
  id: string;
  childId: string;
  sponsorId: string;
  sponsorName: string;
  sponsorEmail: string;
  amount: number;
  frequency: "monthly";
  startDate: Date | string;
  nextDueDate: Date | string;
  isActive: boolean;
  razorpaySubscriptionId?: string;
}

export interface GroceryDrive {
  id: string;
  title: string;
  driveDate: Date | string;
  venue: string;
  itemsNeeded: string[];
  targetFamilies: number;
  pledgesCount: number;
  isActive: boolean;
  description: string;
}

export interface GroceryPledge {
  id: string;
  driveId: string;
  name: string;
  email: string;
  phone: string;
  items: string[];
  quantity: string;
  createdAt: Date | string;
}

export interface CSRInquiry {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  tier: "silver" | "gold" | "platinum";
  budget?: number;
  message: string;
  status: "new" | "contacted" | "proposal-sent" | "closed";
  createdAt: Date | string;
}

export interface FestivalCampaign {
  id: string;
  title: string;
  festival: string;
  startDate: Date | string;
  endDate: Date | string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  bannerUrl: string;
  isActive: boolean;
  createdAt: Date | string;
}

export interface UserProfile {
  uid: string;
  phone: string;
  name: string;
  email?: string;
  city?: string;
  totalDonated: number;
  donationCount: number;
  createdAt: Date | string;
  lastLoginAt: Date | string;
}
