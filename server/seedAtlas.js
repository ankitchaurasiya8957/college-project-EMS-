/**
 * seedAtlas.js — Seeds demo data directly into MongoDB Atlas.
 * Run once with: node seedAtlas.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const dns = require('dns');

dotenv.config();

// ── Same DNS fix as server.js — needed for Atlas SRV lookup ──
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

// Inline minimal schemas to avoid import issues
const UserSchema = new mongoose.Schema({
    name: String, email: { type: String, unique: true },
    password: String, role: { type: String, default: 'user' },
    isVerified: { type: Boolean, default: true },
}, { timestamps: true });

const EventSchema = new mongoose.Schema({
    title: String, description: String,
    date: Date, location: String, category: String,
    totalSeats: Number, availableSeats: Number,
    ticketPrice: { type: Number, default: 0 },
    image: String, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    bookingId: String, status: { type: String, default: 'confirmed' },
    paymentStatus: { type: String, default: 'paid' },
    paymentMethod: { type: String, default: 'free' },
    amount: { type: Number, default: 0 },
    bookingType: { type: String, default: 'booking' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

const usersData = [
    { name: 'Admin User', email: 'admin@eventora.com', password: 'password123', role: 'admin' },
    { name: 'Demo User', email: 'user@eventora.com', password: 'password123', role: 'user' },
    { name: 'Alice Smith', email: 'alice@eventora.com', password: 'password123', role: 'user' },
    { name: 'Rahul Verma', email: 'rahul@eventora.com', password: 'password123', role: 'user' },
    { name: 'Priya Sharma', email: 'priya@eventora.com', password: 'password123', role: 'user' },
];

const eventsData = [
    {
        title: 'React & Node.js Developer Retreat',
        description: 'Join us for a 3-day deep dive into modern full-stack web development. Perfect for developers looking to take their skills to the next level with hands-on workshops and expert mentors.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: 'Silicon Valley Innovation Center, Bangalore',
        category: 'Technology',
        totalSeats: 200,
        ticketPrice: 0,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Neon Nights EDM Festival',
        description: 'Experience an unforgettable night of EDM, techno, and dazzling light shows with top DJs from around the globe. A night you will never forget!',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        location: 'Grand Arena, Mumbai',
        category: 'Music',
        totalSeats: 500,
        ticketPrice: 1500,
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Global Leaders Business Summit',
        description: 'A premium gathering of CEOs, founders, and investors discussing the future of global commerce and AI integration in emerging markets.',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        location: 'The Leela Palace, Delhi',
        category: 'Business',
        totalSeats: 150,
        ticketPrice: 5000,
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Modern Art Expo 2025',
        description: 'Discover breathtaking contemporary and modern arts from underground and trending artists this season. Free entry for students.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        location: 'National Gallery of Modern Art, Pune',
        category: 'Art',
        totalSeats: 300,
        ticketPrice: 200,
        image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Startup Pitch Competition 2025',
        description: 'Watch 25 startups pitch for seed funding. Great networking for entrepreneurs and angel investors. Lunch included for all attendees.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: 'Convention Center, Hyderabad',
        category: 'Business',
        totalSeats: 250,
        ticketPrice: 100,
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Cloud Computing Architecture Seminar',
        description: 'A technical breakdown of scalable cloud solutions, multi-region routing, and serverless compute processing by industry leaders.',
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        location: 'Tech Hub, Chennai',
        category: 'Technology',
        totalSeats: 100,
        ticketPrice: 600,
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Yoga & Wellness Retreat',
        description: 'A 2-day wellness retreat focused on mindfulness, yoga, and holistic health. Includes meals, meditation sessions, and expert-led workshops.',
        date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        location: 'Rishikesh Wellness Resort, Uttarakhand',
        category: 'Sports',
        totalSeats: 80,
        ticketPrice: 2500,
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Stand-Up Comedy Night',
        description: 'A hilarious evening featuring India\'s top stand-up comedians. Come with friends and family for a night of non-stop laughter!',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        location: 'Comedy Club, Kolkata',
        category: 'Entertainment',
        totalSeats: 200,
        ticketPrice: 499,
        image: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?auto=format&fit=crop&q=80&w=800'
    },
];

async function seed() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('❌ MONGO_URI not found in .env');
        process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ Connected to:', mongoose.connection.db.databaseName);

    // ── Clear existing data ──
    await User.deleteMany({});
    await Event.deleteMany({});
    await Booking.deleteMany({});
    console.log('🗑️  Cleared existing data.');

    // ── Create Users ──
    const salt = await bcrypt.genSalt(10);
    const hashedUsers = usersData.map(u => ({
        ...u,
        password: bcrypt.hashSync(u.password, salt),
        isVerified: true,
    }));
    const createdUsers = await User.insertMany(hashedUsers);
    const adminUser = createdUsers.find(u => u.role === 'admin');
    const normalUsers = createdUsers.filter(u => u.role === 'user');
    console.log(`👤 Created ${createdUsers.length} users.`);

    // ── Create Events ──
    const eventsWithAdmin = eventsData.map(e => ({
        ...e,
        availableSeats: e.totalSeats,
        createdBy: adminUser._id,
    }));
    const createdEvents = await Event.insertMany(eventsWithAdmin);
    console.log(`🎉 Created ${createdEvents.length} events.`);

    // ── Create sample bookings for free events ──
    const bookings = [];
    for (const event of createdEvents.filter(e => e.ticketPrice === 0)) {
        const user = normalUsers[0];
        bookings.push({
            userId: user._id,
            eventId: event._id,
            bookingId: `BK-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentMethod: 'free',
            amount: 0,
            bookingType: 'booking',
        });
    }
    if (bookings.length > 0) {
        await Booking.insertMany(bookings);
        console.log(`🎫 Created ${bookings.length} sample bookings.`);
    }

    console.log('\n✅ Atlas seeded successfully!');
    console.log('───────────────────────────────────────');
    console.log('Admin:  admin@eventora.com / password123');
    console.log('User:   user@eventora.com  / password123');
    console.log('───────────────────────────────────────\n');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
