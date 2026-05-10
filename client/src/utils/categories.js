/**
 * Centralized Event Categories Configuration
 * All 14 official Eventora event categories with icons, colors, and descriptions.
 */

// Lucide icon names mapped to category keys
export const EVENT_CATEGORIES = [
  {
    value: 'Business & Corporate',
    label: 'Business & Corporate Events',
    shortLabel: 'Business',
    icon: 'Briefcase',
    color: '#2563eb',       // blue-600
    bgColor: '#dbeafe',     // blue-100
    gradient: 'from-blue-600 to-blue-400',
    description: 'Conferences, seminars, trade shows, and corporate meetings',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Educational & Professional',
    label: 'Educational & Professional Events',
    shortLabel: 'Education',
    icon: 'GraduationCap',
    color: '#7c3aed',       // violet-600
    bgColor: '#ede9fe',     // violet-100
    gradient: 'from-violet-600 to-violet-400',
    description: 'Workshops, training sessions, webinars, and academic events',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Entertainment',
    label: 'Entertainment Events',
    shortLabel: 'Entertainment',
    icon: 'Music',
    color: '#e11d48',       // rose-600
    bgColor: '#ffe4e6',     // rose-100
    gradient: 'from-rose-600 to-pink-400',
    description: 'Concerts, theater, comedy shows, and live performances',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Cultural & Festival',
    label: 'Cultural & Festival Events',
    shortLabel: 'Cultural',
    icon: 'Palette',
    color: '#ea580c',       // orange-600
    bgColor: '#ffedd5',     // orange-100
    gradient: 'from-orange-600 to-amber-400',
    description: 'Art exhibitions, cultural festivals, heritage events, and fairs',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Sports & Fitness',
    label: 'Sports & Fitness Events',
    shortLabel: 'Sports',
    icon: 'Trophy',
    color: '#16a34a',       // green-600
    bgColor: '#dcfce7',     // green-100
    gradient: 'from-green-600 to-emerald-400',
    description: 'Tournaments, marathons, fitness camps, and sports meets',
    image: 'https://images.unsplash.com/photo-1461896836934-bd45ba8addbc?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Technology & Gaming',
    label: 'Technology & Gaming Events',
    shortLabel: 'Tech & Gaming',
    icon: 'Gamepad2',
    color: '#0891b2',       // cyan-600
    bgColor: '#cffafe',     // cyan-100
    gradient: 'from-cyan-600 to-teal-400',
    description: 'Hackathons, gaming tournaments, tech expos, and LAN parties',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Community & Social',
    label: 'Community & Social Events',
    shortLabel: 'Community',
    icon: 'Users',
    color: '#0d9488',       // teal-600
    bgColor: '#ccfbf1',     // teal-100
    gradient: 'from-teal-600 to-green-400',
    description: 'Community gatherings, social mixers, and volunteer events',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Charity & Fundraising',
    label: 'Charity & Fundraising Events',
    shortLabel: 'Charity',
    icon: 'Heart',
    color: '#db2777',       // pink-600
    bgColor: '#fce7f3',     // pink-100
    gradient: 'from-pink-600 to-rose-400',
    description: 'Fundraisers, charity galas, benefit concerts, and auctions',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Religious & Spiritual',
    label: 'Religious & Spiritual Events',
    shortLabel: 'Spiritual',
    icon: 'Flame',
    color: '#b45309',       // amber-700
    bgColor: '#fef3c7',     // amber-100
    gradient: 'from-amber-700 to-yellow-400',
    description: 'Retreats, prayer meetings, spiritual workshops, and pilgrimages',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Networking & Meetup',
    label: 'Networking & Meetup Events',
    shortLabel: 'Networking',
    icon: 'Handshake',
    color: '#4f46e5',       // indigo-600
    bgColor: '#e0e7ff',     // indigo-100
    gradient: 'from-indigo-600 to-blue-400',
    description: 'Professional meetups, industry mixers, and speed networking',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Promotional & Marketing',
    label: 'Promotional & Marketing Events',
    shortLabel: 'Marketing',
    icon: 'Megaphone',
    color: '#dc2626',       // red-600
    bgColor: '#fee2e2',     // red-100
    gradient: 'from-red-600 to-orange-400',
    description: 'Product launches, brand activations, and promotional campaigns',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Lifestyle & Wellness',
    label: 'Lifestyle & Wellness Events',
    shortLabel: 'Wellness',
    icon: 'Leaf',
    color: '#059669',       // emerald-600
    bgColor: '#d1fae5',     // emerald-100
    gradient: 'from-emerald-600 to-green-400',
    description: 'Yoga retreats, wellness workshops, and lifestyle expos',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Public & Fan Engagement',
    label: 'Public & Fan Engagement Events',
    shortLabel: 'Fan Events',
    icon: 'Star',
    color: '#ca8a04',       // yellow-600
    bgColor: '#fef9c3',     // yellow-100
    gradient: 'from-yellow-600 to-amber-300',
    description: 'Fan meetups, autograph sessions, and public appearances',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Virtual & Hybrid',
    label: 'Virtual & Hybrid Events',
    shortLabel: 'Virtual',
    icon: 'Monitor',
    color: '#6366f1',       // indigo-500
    bgColor: '#e0e7ff',     // indigo-100
    gradient: 'from-indigo-500 to-purple-400',
    description: 'Online webinars, virtual conferences, and hybrid events',
    image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&q=80&w=800'
  }
];

/**
 * Get category configuration by value.
 * @param {string} categoryValue - The category value string
 * @returns {Object|undefined} The matching category config
 */
export const getCategoryConfig = (categoryValue) => {
  return EVENT_CATEGORIES.find(c => c.value === categoryValue);
};

/**
 * Get just the category values (for dropdowns, enums, etc.)
 */
export const CATEGORY_VALUES = EVENT_CATEGORIES.map(c => c.value);

export default EVENT_CATEGORIES;
