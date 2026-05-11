const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Booking');

dotenv.config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

const users = [
  { name: 'Admin User', email: 'admin@eventora.com', password: 'password123', role: 'admin' },
  { name: 'Demo User', email: 'user@eventora.com', password: 'password123', role: 'user' },
  { name: 'Alice Smith', email: 'alice@eventora.com', password: 'password123', role: 'user' },
  { name: 'Bob Johnson', email: 'bob@eventora.com', password: 'password123', role: 'user' },
  { name: 'Charlie Dave', email: 'charlie@eventora.com', password: 'password123', role: 'user' },
  { name: 'Diana Prince', email: 'diana@eventora.com', password: 'password123', role: 'user' },
  { name: 'Ethan Hunt', email: 'ethan@eventora.com', password: 'password123', role: 'user' },
  { name: 'Fiona Gallagher', email: 'fiona@eventora.com', password: 'password123', role: 'user' },
  { name: 'George Miller', email: 'george@eventora.com', password: 'password123', role: 'user' },
  { name: 'Hannah Montana', email: 'hannah@eventora.com', password: 'password123', role: 'user' }
];

// Template data per category — each will generate ~14-15 events
const categoryTemplates = [
  { category: 'Business & Networking', items: [
    { t: 'Global Leaders Business Summit', d: 'A premium gathering of CEOs and investors discussing the future of global commerce.', img: 'photo-1556761175-5973dc0f32e7' },
    { t: 'Startup Pitch Competition', d: 'Watch 25 startups pitch for seed funding. Great networking for entrepreneurs.', img: 'photo-1522071820081-009f0129c71c' },
    { t: 'Founders Speed Networking', d: 'Meet 50+ investors in a structured speed networking format.', img: 'photo-1515187029135-18ee286d815b' },
    { t: 'Brand Launch: NextGen Smartphones', d: 'Live demos, exclusive offers, and celebrity appearances.', img: 'photo-1505373877841-8d25f7d46678' },
    { t: 'Women in Business Conference', d: 'Empowering women leaders through panels, workshops, and networking.', img: 'photo-1573164713714-d95e436ab8d6' },
    { t: 'International Trade Expo 2025', d: 'Connect with global suppliers and distributors across industries.', img: 'photo-1559136555-9303baea8ebd' },
    { t: 'Digital Marketing Masterclass', d: 'Learn SEO, SEM, and social media marketing from industry experts.', img: 'photo-1460925895917-afdab827c52f' },
    { t: 'Angel Investor Meet & Greet', d: 'Exclusive event connecting early-stage startups with angel investors.', img: 'photo-1551836022-d5d88e9218df' },
    { t: 'Sales Leadership Forum', d: 'Transform your sales strategy with data-driven insights.', img: 'photo-1552664730-d307ca884978' },
    { t: 'E-Commerce Growth Summit', d: 'Strategies for scaling your online business in 2025.', img: 'photo-1556742049-0cfed4f6a45d' },
    { t: 'Real Estate Investment Seminar', d: 'Expert insights on commercial and residential property investments.', img: 'photo-1560518883-ce09059eeffa' },
    { t: 'Corporate Innovation Workshop', d: 'Design thinking and innovation frameworks for enterprise teams.', img: 'photo-1517048676732-d65bc937f952' },
    { t: 'FinTech Disruption Conference', d: 'Exploring blockchain, digital payments, and financial innovation.', img: 'photo-1518186285589-2f7649de83e0' },
    { t: 'Franchise Opportunities Fair', d: 'Discover franchise models and meet brand representatives.', img: 'photo-1556761175-4b46a572b786' },
    { t: 'Supply Chain Excellence Summit', d: 'Optimizing logistics, procurement, and supply chain management.', img: 'photo-1586528116311-ad8dd3c8310d' },
  ]},
  { category: 'Education & Workshops', items: [
    { t: 'Future of AI in Education', d: 'Hands-on workshop on AI transforming classrooms worldwide.', img: 'photo-1524178232363-1fb2b075b655' },
    { t: 'Data Science Bootcamp', d: 'Intensive 3-day bootcamp covering Python, ML, and data visualization.', img: 'photo-1509228468518-180dd4864904' },
    { t: 'Creative Writing Workshop', d: 'Unlock your storytelling potential with published authors.', img: 'photo-1455390582262-044cdead277a' },
    { t: 'Leadership Skills Seminar', d: 'Develop essential leadership and management skills.', img: 'photo-1531482615713-2afd69097998' },
    { t: 'Photography Masterclass', d: 'From composition to post-processing with award-winning photographers.', img: 'photo-1542038784456-1ea8e935640e' },
    { t: 'Public Speaking Workshop', d: 'Overcome stage fright and deliver compelling presentations.', img: 'photo-1475721027785-f74eccf877e2' },
    { t: 'STEM Education Conference', d: 'Innovative approaches to teaching science and technology.', img: 'photo-1532094349884-543bc11b234d' },
    { t: 'UX/UI Design Fundamentals', d: 'Learn user-centered design principles and prototyping tools.', img: 'photo-1559028012-481c04fa702d' },
    { t: 'Financial Literacy Workshop', d: 'Personal finance, investing, and retirement planning basics.', img: 'photo-1554224155-6726b3ff858f' },
    { t: 'Language Learning Festival', d: 'Interactive sessions in Spanish, French, Japanese, and more.', img: 'photo-1546410531-bb4caa6b424d' },
    { t: 'Robotics Workshop for Kids', d: 'Hands-on robotics and coding for ages 8-16.', img: 'photo-1485827404703-89b55fcc595e' },
    { t: 'MBA Prep Masterclass', d: 'GMAT strategies, essay writing, and application tips.', img: 'photo-1434030216411-0b793f4b4173' },
    { t: 'Environmental Science Symposium', d: 'Climate change research and sustainability solutions.', img: 'photo-1532996122724-e3c354a0b15b' },
    { t: 'Cybersecurity Awareness Training', d: 'Protect your digital life: phishing, passwords, and privacy.', img: 'photo-1550751827-4bd374c3f58b' },
  ]},
  { category: 'Entertainment & Culture', items: [
    { t: 'Neon Nights EDM Festival', d: 'Unforgettable night of EDM and dazzling light shows.', img: 'photo-1514525253161-7a46d19cd819' },
    { t: 'Stand-Up Comedy Night', d: 'Non-stop laughter with top stand-up comedians.', img: 'photo-1585699324551-f6c309eedeca' },
    { t: 'Modern Art Expo 2025', d: 'Contemporary art from underground and trending artists.', img: 'photo-1536924940846-227afb31e2a5' },
    { t: 'Diwali Cultural Celebration', d: 'Festival of lights with traditional dances, music, and food.', img: 'photo-1533174072545-7a4b6ad7a6c3' },
    { t: 'Comic Con India 2025', d: 'Pop culture convention with cosplay, panels, and exclusive merch.', img: 'photo-1492684223066-81342ee5ff30' },
    { t: 'Jazz & Blues Evening', d: 'Soulful performances by renowned jazz and blues artists.', img: 'photo-1511192336575-5a79af67a629' },
    { t: 'Bollywood Dance Night', d: 'Dance the night away with Bollywood hits and live DJs.', img: 'photo-1504609773096-104ff2c73ba4' },
    { t: 'International Film Festival', d: 'Screenings of award-winning films from around the world.', img: 'photo-1489599849927-2ee91cede3ba' },
    { t: 'Street Food & Music Festival', d: 'Gourmet street food paired with live indie bands.', img: 'photo-1555939594-58d7cb561ad1' },
    { t: 'Classical Music Concert', d: 'Symphony orchestra performing timeless classical masterpieces.', img: 'photo-1465847899084-d164df4dedc6' },
    { t: 'Poetry Slam Championship', d: 'Spoken word artists compete in this electrifying event.', img: 'photo-1474631245212-32dc3c8310c6' },
    { t: 'Holi Color Festival', d: 'The festival of colors with music, dance, and celebration.', img: 'photo-1576079635464-c0d40fdcb36c' },
    { t: 'Magic & Illusion Show', d: 'Mind-bending magic performances by world-class illusionists.', img: 'photo-1503095396549-807759245b35' },
    { t: 'Anime & Manga Convention', d: 'Cosplay contests, manga workshops, and anime screenings.', img: 'photo-1578632767115-351597cf2477' },
    { t: 'Rock Music Festival', d: 'Three days of rock and metal bands on multiple stages.', img: 'photo-1459749411175-04bf5292ceea' },
  ]},
  { category: 'Sports & Fitness', items: [
    { t: 'Urban Marathon 2025', d: '42km urban marathon through the scenic cityscape.', img: 'photo-1461896836934-bd45ba8addbc' },
    { t: 'CrossFit Championship', d: 'Elite athletes compete in grueling CrossFit challenges.', img: 'photo-1534438327276-14e5300c3a48' },
    { t: 'Cricket Premier League Finals', d: 'Watch the thrilling finals of the premier cricket league.', img: 'photo-1531415074968-036ba1b575da' },
    { t: 'Swimming Championship', d: 'National-level swimming competition across all categories.', img: 'photo-1530549387789-4c1017266635' },
    { t: 'Cycling Tour de City', d: '100km cycling event through scenic countryside routes.', img: 'photo-1541625602330-2277a4c46182' },
    { t: 'Boxing Night Live', d: 'Professional boxing bouts with championship titles at stake.', img: 'photo-1549719386-74dfcbf7dbed' },
    { t: 'Football Tournament 2025', d: 'Inter-city football tournament with 32 competing teams.', img: 'photo-1553778263-73a83bab9b0c' },
    { t: 'Tennis Open Championship', d: 'Watch rising stars compete in singles and doubles.', img: 'photo-1554068865-24cecd4e34b8' },
    { t: 'Adventure Sports Festival', d: 'Rock climbing, rappelling, zip-lining, and more.', img: 'photo-1504280390367-361c6d9f38f4' },
    { t: 'Badminton Masters Cup', d: 'Top-ranked players battle for the masters cup title.', img: 'photo-1626224583764-f87db24ac4ea' },
    { t: 'Martial Arts Exhibition', d: 'Karate, Taekwondo, and MMA demonstrations and workshops.', img: 'photo-1555597673-b21d5c935865' },
    { t: 'Table Tennis Championship', d: 'Fast-paced table tennis tournament for all age groups.', img: 'photo-1558618666-fcd25c85f82e' },
    { t: 'Triathlon Challenge', d: 'Swim, bike, and run in this ultimate endurance challenge.', img: 'photo-1530549387789-4c1017266635' },
    { t: 'Kabaddi League Season 5', d: 'India\'s favorite contact sport in an exciting league format.', img: 'photo-1574629810360-7efbbe195018' },
  ]},
  { category: 'Tech & Innovation', items: [
    { t: 'React & Node.js Developer Retreat', d: 'Deep dive into modern full-stack web development.', img: 'photo-1540575467063-178a50c2df87' },
    { t: 'Cloud Computing Seminar', d: 'Scalable cloud solutions and serverless computing.', img: 'photo-1451187580459-43490279c0fa' },
    { t: 'Global Remote Work Summit', d: 'Future of remote work, digital nomadism, and collaboration.', img: 'photo-1588196749597-9ff075ee6b5b' },
    { t: 'AI & Machine Learning Expo', d: 'Latest breakthroughs in artificial intelligence and deep learning.', img: 'photo-1555255707-c07966088b7b' },
    { t: 'Blockchain Developer Conference', d: 'Smart contracts, DeFi, and Web3 development workshops.', img: 'photo-1639762681485-074b7f938ba0' },
    { t: 'Hackathon: Code for Good', d: '48-hour hackathon solving real-world social problems.', img: 'photo-1504384308090-c894fdcc538d' },
    { t: 'IoT & Smart Home Expo', d: 'Connected devices, home automation, and IoT innovations.', img: 'photo-1558618666-fcd25c85f82e' },
    { t: 'DevOps & CI/CD Workshop', d: 'Docker, Kubernetes, and modern deployment pipelines.', img: 'photo-1518432031352-d6fc5c10da5a' },
    { t: 'Mobile App Development Summit', d: 'React Native, Flutter, and cross-platform development.', img: 'photo-1512941937669-90a1b58e7e9c' },
    { t: 'Quantum Computing Symposium', d: 'Exploring the frontier of quantum algorithms and hardware.', img: 'photo-1635070041078-e363dbe005cb' },
    { t: 'Open Source Contributors Meetup', d: 'Celebrate and contribute to open source projects.', img: 'photo-1556075798-4825dfaaf498' },
    { t: 'AR/VR Innovation Lab', d: 'Hands-on with augmented and virtual reality technologies.', img: 'photo-1617802690992-15d93263d3a9' },
    { t: 'Data Engineering Conference', d: 'ETL pipelines, data lakes, and real-time analytics.', img: 'photo-1551288049-bebda4e38f71' },
    { t: 'Green Tech & Sustainability', d: 'Technology solutions for environmental sustainability.', img: 'photo-1497436072909-60f360e1d4b1' },
  ]},
  { category: 'Community & Social', items: [
    { t: 'Community Cleanup Drive', d: 'Clean up our local parks and streets together.', img: 'photo-1529156069898-49953e39b3ac' },
    { t: 'Hope Gala — Charity Dinner', d: 'Fine dining to raise funds for children\'s education.', img: 'photo-1559027615-cd4628902d4a' },
    { t: 'Inner Peace Meditation Retreat', d: 'Silent meditation retreat led by renowned monks.', img: 'photo-1507003211169-0a1dd7228f2d' },
    { t: 'Blood Donation Camp', d: 'Save lives by donating blood. Free health checkup included.', img: 'photo-1536856136534-bb679c52a9aa' },
    { t: 'Volunteer Training Program', d: 'Learn effective volunteering and community engagement skills.', img: 'photo-1559027615-cd4628902d4a' },
    { t: 'Senior Citizens Appreciation Day', d: 'Honoring our elders with entertainment and gifts.', img: 'photo-1517486808906-6ca8b3f04846' },
    { t: 'Pet Adoption Drive', d: 'Find your furry companion at our community adoption event.', img: 'photo-1601758228041-f3b2795255f1' },
    { t: 'Tree Plantation Drive', d: 'Plant trees and contribute to a greener future.', img: 'photo-1542601906990-b4d3fb778b09' },
    { t: 'Cultural Exchange Festival', d: 'Celebrate diversity through food, art, and performances.', img: 'photo-1506157786151-b8491531f063' },
    { t: 'Youth Leadership Camp', d: 'Empowering young leaders through activities and mentorship.', img: 'photo-1529390079861-591de354faf5' },
    { t: 'Mental Health Awareness Walk', d: 'Walk together to raise awareness about mental health.', img: 'photo-1571019613454-1cb2f99b2d8b' },
    { t: 'Disaster Relief Fundraiser', d: 'Raising funds for communities affected by natural disasters.', img: 'photo-1469571486292-0ba58a3f068b' },
    { t: 'Interfaith Harmony Gathering', d: 'Promoting peace and understanding across all faiths.', img: 'photo-1511632765486-a01980e01a18' },
    { t: 'Neighborhood Block Party', d: 'Music, food, games, and fun for the whole community.', img: 'photo-1529543544282-ea9407407e6d' },
  ]},
  { category: 'Lifestyle & Wellness', items: [
    { t: 'Sunrise Yoga on the Beach', d: 'Energizing yoga with international instructors.', img: 'photo-1544367567-0f2fcb009e0b' },
    { t: 'Organic Food & Farm Festival', d: 'Farm-to-table experiences and organic produce market.', img: 'photo-1488459716781-31db52582fe9' },
    { t: 'Mindfulness & Meditation Workshop', d: 'Practical techniques for stress relief and mental clarity.', img: 'photo-1506126613408-eca07ce68773' },
    { t: 'Spa & Wellness Retreat', d: 'Weekend retreat with spa treatments and wellness talks.', img: 'photo-1540555700478-4be289fbec6b' },
    { t: 'Healthy Cooking Masterclass', d: 'Learn nutritious recipes from celebrity chefs.', img: 'photo-1556909114-f6e7ad7d3136' },
    { t: 'Pilates & Core Strength Camp', d: 'Intensive pilates sessions for all fitness levels.', img: 'photo-1518611012118-696072aa579a' },
    { t: 'Ayurveda & Natural Healing', d: 'Ancient Ayurvedic practices for modern wellness.', img: 'photo-1498837167922-ddd27525d352' },
    { t: 'Fashion & Style Workshop', d: 'Personal styling tips and wardrobe makeover session.', img: 'photo-1558618666-fcd25c85f82e' },
    { t: 'Wine Tasting Evening', d: 'Curated wines paired with artisan cheeses and stories.', img: 'photo-1510812431401-41d2bd2722f3' },
    { t: 'Sleep Science Workshop', d: 'Improve your sleep quality with science-backed techniques.', img: 'photo-1541781774459-bb2af2f05b55' },
    { t: 'Digital Detox Weekend', d: 'Unplug and reconnect with nature and yourself.', img: 'photo-1506905925346-21bda4d32df4' },
    { t: 'Dance Fitness Party', d: 'Zumba, hip-hop, and Bollywood dance workout.', img: 'photo-1524594152303-9fd13543fe6e' },
    { t: 'Wellness Book Club Launch', d: 'Monthly book club focusing on health and self-improvement.', img: 'photo-1512820790803-83ca734da794' },
    { t: 'Aromatherapy & Essential Oils', d: 'Discover the healing power of essential oils.', img: 'photo-1515377905703-c4788e51af15' },
  ]},
];

function generateEvents() {
  const events = [];
  const locations = [
    'The Ritz-Carlton, London', 'Convention Center, Miami', 'MIT Campus, Boston',
    'Grand Arena, New York', 'Marine Drive, Mumbai', 'Silicon Valley, CA',
    'Central Park, Pune', 'Grand Hyatt, Bangalore', 'Goa Beach Resort, Goa',
    'NSCI Dome, Mumbai', 'WeWork, Hyderabad', 'Pragati Maidan, Delhi',
    'Nehru Centre, Delhi', 'Canvas Laugh Club, Mumbai', 'Tech Hub, Seattle',
    'Isha Foundation, Coimbatore', 'IIT Campus, Chennai', 'Marriott, Jaipur',
    'JW Marriott, Kolkata', 'Taj Palace, New Delhi', 'Expo Center, Dubai',
  ];

  for (const tpl of categoryTemplates) {
    for (let i = 0; i < tpl.items.length; i++) {
      const item = tpl.items[i];
      const dayOffset = Math.floor(Math.random() * 60) + 2; // 2-62 days in future
      events.push({
        title: item.t,
        description: item.d,
        date: new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000),
        location: locations[Math.floor(Math.random() * locations.length)],
        category: tpl.category,
        totalSeats: [80, 100, 120, 150, 200, 250, 300, 400, 500, 800, 1000][Math.floor(Math.random() * 11)],
        ticketPrice: [0, 0, 100, 200, 300, 350, 400, 500, 600, 750, 800, 1000, 1200, 1500, 2000, 2500, 5000][Math.floor(Math.random() * 17)],
        image: `https://images.unsplash.com/${item.img}?auto=format&fit=crop&q=80&w=800`
      });
    }
  }
  return events;
}

const seedDatabase = async (providedMongoose) => {
  const isProgrammatic = !!providedMongoose;
  try {
    if (!isProgrammatic) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventora', { dbName: 'eventora' });
      console.log('\n✅ MongoDB connection open...');
    } else {
      console.log('\n✅ Running seed script programmatically...');
    }

    await User.deleteMany();
    await Event.deleteMany();
    await Booking.deleteMany();
    console.log('🗑️  Cleared existing data.');

    const salt = await bcrypt.genSalt(10);
    const hashedUsers = users.map(u => ({ ...u, password: bcrypt.hashSync(u.password, salt), isVerified: true }));
    const createdUsers = await User.insertMany(hashedUsers);
    const adminUser = createdUsers.find(u => u.role === 'admin');
    const normalUsers = createdUsers.filter(u => u.role === 'user');
    console.log(`👤 Created ${createdUsers.length} users.`);

    const events = generateEvents();
    const eventsWithAdmin = events.map(e => ({ ...e, availableSeats: e.totalSeats, createdBy: adminUser._id }));
    const createdEvents = await Event.insertMany(eventsWithAdmin);
    console.log(`🎉 Created ${createdEvents.length} events across 7 categories.`);

    // Generate bookings
    const bookingsData = [];
    const now = new Date();
    for (const event of createdEvents) {
      const count = Math.floor(Math.random() * 4) + 2;
      const shuffled = [...normalUsers].sort(() => 0.5 - Math.random()).slice(0, count);
      for (const user of shuffled) {
        const statuses = ['pending', 'confirmed', 'confirmed', 'confirmed', 'cancelled'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        let paymentStatus = 'not_paid';
        if (status === 'confirmed' && event.ticketPrice > 0) paymentStatus = Math.random() > 0.1 ? 'paid' : 'not_paid';
        else if (event.ticketPrice === 0) paymentStatus = 'paid';
        const month = Math.floor(Math.random() * (now.getMonth() + 1));
        const day = Math.floor(Math.random() * 28) + 1;
        const bookedAt = new Date(now.getFullYear(), month, day, Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60));
        bookingsData.push({
          userId: user._id, eventId: event._id,
          bookingId: `EVT-${now.toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substring(2,6).toUpperCase()}`,
          status, paymentStatus, amount: event.ticketPrice, bookingType: 'booking', bookedAt, createdAt: bookedAt, updatedAt: bookedAt
        });
        if (status === 'confirmed') { event.availableSeats -= 1; await event.save(); }
      }
    }
    await Booking.insertMany(bookingsData);
    console.log(`🎫 Created ${bookingsData.length} bookings.`);
    console.log('\n🚀 Database seeded successfully!');
    console.log('-------------------------------------------');
    console.log('Admin: admin@eventora.com / password123');
    console.log('User:  user@eventora.com  / password123');
    console.log('-------------------------------------------\n');
    if (!isProgrammatic) process.exit();
  } catch (error) {
    console.error('❌ Error seeding:', error.message);
    if (!isProgrammatic) process.exit(1);
  }
};

if (require.main === module) seedDatabase();
module.exports = seedDatabase;
