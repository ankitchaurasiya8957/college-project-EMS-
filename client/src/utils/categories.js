/**
 * Centralized Event Categories Configuration (Consolidated)
 * 7 categories that cover all event types with icons, colors, and descriptions.
 */

export const EVENT_CATEGORIES = [
  {
    value: 'Business & Networking',
    label: 'Business & Networking',
    shortLabel: 'Business',
    icon: 'Briefcase',
    color: '#2563eb',       // blue-600
    bgColor: '#dbeafe',     // blue-100
    gradient: 'from-blue-600 to-blue-400',
    description: 'Conferences, trade shows, corporate events, meetups, product launches, and professional networking',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Education & Workshops',
    label: 'Education & Workshops',
    shortLabel: 'Education',
    icon: 'GraduationCap',
    color: '#7c3aed',       // violet-600
    bgColor: '#ede9fe',     // violet-100
    gradient: 'from-violet-600 to-violet-400',
    description: 'Training sessions, webinars, academic events, seminars, and professional development',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Entertainment & Culture',
    label: 'Entertainment & Culture',
    shortLabel: 'Entertainment',
    icon: 'Music',
    color: '#e11d48',       // rose-600
    bgColor: '#ffe4e6',     // rose-100
    gradient: 'from-rose-600 to-pink-400',
    description: 'Concerts, theater, comedy, festivals, art exhibitions, fan events, and cultural celebrations',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Sports & Fitness',
    label: 'Sports & Fitness',
    shortLabel: 'Sports',
    icon: 'Trophy',
    color: '#16a34a',       // green-600
    bgColor: '#dcfce7',     // green-100
    gradient: 'from-green-600 to-emerald-400',
    description: 'Tournaments, marathons, fitness camps, sports meets, and athletic competitions',
    image: 'https://images.unsplash.com/photo-1461896836934-bd45ba8addbc?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Tech & Innovation',
    label: 'Tech & Innovation',
    shortLabel: 'Tech',
    icon: 'Monitor',
    color: '#0891b2',       // cyan-600
    bgColor: '#cffafe',     // cyan-100
    gradient: 'from-cyan-600 to-teal-400',
    description: 'Hackathons, gaming tournaments, tech expos, virtual events, and innovation showcases',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Community & Social',
    label: 'Community & Social',
    shortLabel: 'Community',
    icon: 'Heart',
    color: '#db2777',       // pink-600
    bgColor: '#fce7f3',     // pink-100
    gradient: 'from-pink-600 to-rose-400',
    description: 'Community gatherings, charity events, volunteer drives, spiritual retreats, and social causes',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800'
  },
  {
    value: 'Lifestyle & Wellness',
    label: 'Lifestyle & Wellness',
    shortLabel: 'Wellness',
    icon: 'Leaf',
    color: '#059669',       // emerald-600
    bgColor: '#d1fae5',     // emerald-100
    gradient: 'from-emerald-600 to-green-400',
    description: 'Yoga retreats, wellness workshops, lifestyle expos, and health-focused experiences',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800'
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
