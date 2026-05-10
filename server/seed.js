const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Booking');

dotenv.config();

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

const events = [
    // 1. Business & Corporate Events
    {
        title: 'Global Leaders Business Summit',
        description: 'A premium gathering of CEOs, founders, and investors discussing the future of global commerce and AI integration.',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        location: 'The Ritz-Carlton, London',
        category: 'Business & Corporate',
        totalSeats: 150,
        ticketPrice: 5000,
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Startup Pitch & Pitch Competition',
        description: 'Watch 25 startups pitch for 1 million dollars in seed funding. Great networking for entrepreneurs and angel investors.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: 'Convention Center, Miami',
        category: 'Business & Corporate',
        totalSeats: 250,
        ticketPrice: 100,
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
    },

    // 2. Educational & Professional Events
    {
        title: 'Future of AI in Education Workshop',
        description: 'A hands-on workshop exploring how artificial intelligence is transforming classrooms and learning experiences worldwide.',
        date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        location: 'MIT Campus, Boston',
        category: 'Educational & Professional',
        totalSeats: 120,
        ticketPrice: 300,
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800'
    },

    // 3. Entertainment Events
    {
        title: 'Neon Nights EDM Festival',
        description: 'Experience an unforgettable night of EDM, techno, and dazzling light shows with top DJs from around the globe.',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        location: 'Grand Arena, New York',
        category: 'Entertainment',
        totalSeats: 500,
        ticketPrice: 1500,
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Stand-Up Comedy Night with Top Comedians',
        description: 'An evening of non-stop laughter featuring India\'s top stand-up comedians performing their best routines.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: 'Canvas Laugh Club, Mumbai',
        category: 'Entertainment',
        totalSeats: 200,
        ticketPrice: 500,
        image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&q=80&w=800'
    },

    // 4. Cultural & Festival Events
    {
        title: 'Modern Art Expo 2025',
        description: 'Discover breathtaking contemporary and modern arts from underground and trending artists this season.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        location: 'Downtown Art Museum',
        category: 'Cultural & Festival',
        totalSeats: 300,
        ticketPrice: 200,
        image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Diwali Cultural Celebration',
        description: 'A grand celebration of the festival of lights with traditional dances, music, food, and a spectacular fireworks display.',
        date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        location: 'Nehru Centre, Delhi',
        category: 'Cultural & Festival',
        totalSeats: 800,
        ticketPrice: 0,
        image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800'
    },

    // 5. Sports & Fitness Events
    {
        title: 'Urban Marathon 2025',
        description: 'Join thousands of runners in the annual 42km urban marathon through the scenic cityscape. Categories for all fitness levels.',
        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        location: 'Marine Drive, Mumbai',
        category: 'Sports & Fitness',
        totalSeats: 1000,
        ticketPrice: 750,
        image: 'https://images.unsplash.com/photo-1461896836934-bd45ba8addbc?auto=format&fit=crop&q=80&w=800'
    },

    // 6. Technology & Gaming Events
    {
        title: 'React & Node.js Developer Retreat',
        description: 'Join us for a 3-day deep dive into modern full-stack web development. Perfect for developers looking to take their skills to the next level.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: 'Silicon Valley Innovation Center, CA',
        category: 'Technology & Gaming',
        totalSeats: 200,
        ticketPrice: 0,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Cloud Computing Architecture Seminar',
        description: 'A purely technical breakdown of scalable cloud solutions, multi-region routing, and serverless compute processing.',
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        location: 'Tech Hub, Seattle',
        category: 'Technology & Gaming',
        totalSeats: 100,
        ticketPrice: 600,
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    },

    // 7. Community & Social Events
    {
        title: 'Neighborhood Community Cleanup Drive',
        description: 'Come together as a community to clean up our local parks and streets. Refreshments and supplies provided. Bring the whole family!',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        location: 'Central Park, Pune',
        category: 'Community & Social',
        totalSeats: 500,
        ticketPrice: 0,
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800'
    },

    // 8. Charity & Fundraising Events
    {
        title: 'Hope Gala — Annual Charity Dinner',
        description: 'An elegant evening of fine dining and entertainment to raise funds for children\'s education. Silent auction and live performances included.',
        date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        location: 'Grand Hyatt Ballroom, Bangalore',
        category: 'Charity & Fundraising',
        totalSeats: 200,
        ticketPrice: 2500,
        image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800'
    },

    // 9. Religious & Spiritual Events
    {
        title: 'Inner Peace Meditation Retreat',
        description: 'A 2-day silent meditation retreat led by renowned monks. Disconnect from the digital world and reconnect with your inner self.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: 'Isha Foundation, Coimbatore',
        category: 'Religious & Spiritual',
        totalSeats: 80,
        ticketPrice: 1200,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'
    },

    // 10. Networking & Meetup Events
    {
        title: 'Founders & Investors Speed Networking',
        description: 'Meet 50+ investors and 100+ startup founders in a structured speed networking format. Great for building meaningful connections.',
        date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        location: 'WeWork, Hyderabad',
        category: 'Networking & Meetup',
        totalSeats: 150,
        ticketPrice: 400,
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800'
    },

    // 11. Promotional & Marketing Events
    {
        title: 'Brand Launch: NextGen Smartphones',
        description: 'Be the first to experience the next generation of smartphones. Live demos, exclusive offers, and celebrity appearances.',
        date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        location: 'Pragati Maidan, Delhi',
        category: 'Promotional & Marketing',
        totalSeats: 400,
        ticketPrice: 0,
        image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800'
    },

    // 12. Lifestyle & Wellness Events
    {
        title: 'Sunrise Yoga Festival on the Beach',
        description: 'Start your day with an energizing yoga session on the beach. International yoga instructors, organic food stalls, and wellness talks.',
        date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        location: 'Goa Beach Resort, Goa',
        category: 'Lifestyle & Wellness',
        totalSeats: 250,
        ticketPrice: 350,
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800'
    },

    // 13. Public & Fan Engagement Events
    {
        title: 'Comic Con India 2025',
        description: 'The biggest pop culture convention in India. Meet your favorite comic artists, cosplay competitions, exclusive merch, and panel discussions.',
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        location: 'NSCI Dome, Mumbai',
        category: 'Public & Fan Engagement',
        totalSeats: 1500,
        ticketPrice: 800,
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'
    },

    // 14. Virtual & Hybrid Events
    {
        title: 'Global Remote Work Summit (Hybrid)',
        description: 'Join from anywhere! A hybrid conference exploring the future of remote work, digital nomadism, and virtual collaboration tools.',
        date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        location: 'Online + Bangalore (Hybrid)',
        category: 'Virtual & Hybrid',
        totalSeats: 2000,
        ticketPrice: 0,
        image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&q=80&w=800'
    }
];

const seedDatabase = async (providedMongoose) => {
    const isProgrammatic = !!providedMongoose;
    try {
        if (!isProgrammatic) {
            await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventora');
            console.log('\n✅ MongoDB connection open...');
        } else {
            console.log('\n✅ Running seed script programmatically...');
        }

        await User.deleteMany();
        await Event.deleteMany();
        await Booking.deleteMany();
        console.log('🗑️  Cleared existing data.');

        // Hash user passwords
        const salt = await bcrypt.genSalt(10);
        const hashedUsers = users.map(u => ({
            ...u,
            password: bcrypt.hashSync(u.password, salt),
            isVerified: true
        }));

        const createdUsers = await User.insertMany(hashedUsers);
        const adminUser = createdUsers.find(u => u.role === 'admin');
        const normalUsers = createdUsers.filter(u => u.role === 'user');
        console.log(`👤 Created ${createdUsers.length} total dummy users.`);

        // Link events to admin
        const eventsWithAdmin = events.map(e => ({
            ...e,
            availableSeats: e.totalSeats,
            createdBy: adminUser._id
        }));

        const createdEvents = await Event.insertMany(eventsWithAdmin);
        console.log(`🎉 Created ${createdEvents.length} events across 14 categories with Unsplash images.`);

        // Generate Bookings Data
        const bookingsData = [];

        for (const event of createdEvents) {
            // Assign 3-6 random users to each event
            const randomCount = Math.floor(Math.random() * 4) + 3;
            // Shuffle and pick random users
            const shuffledUsers = [...normalUsers].sort(() => 0.5 - Math.random());
            const selectedUsers = shuffledUsers.slice(0, randomCount);

            for (const user of selectedUsers) {
                // Randomize statuses
                const statuses = ['pending', 'confirmed', 'cancelled'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                let paymentStatus = 'not_paid';
                if (status === 'confirmed' && event.ticketPrice > 0) {
                    // Usually confirmed tickets are marked paid (90% of the time)
                    paymentStatus = Math.random() > 0.1 ? 'paid' : 'not_paid';
                } else if (event.ticketPrice === 0) {
                    paymentStatus = 'paid';
                }

                bookingsData.push({
                    userId: user._id,
                    eventId: event._id,
                    status: status,
                    paymentStatus: paymentStatus,
                    amount: event.ticketPrice
                });

                // Deduct available seats specifically for confirmed tickets!
                if (status === 'confirmed') {
                    event.availableSeats -= 1;
                    await event.save();
                }
            }
        }

        await Booking.insertMany(bookingsData);
        console.log(`🎫 Inserted ${bookingsData.length} randomized dummy bookings (confirmed, pending, cancelled, paid, not_paid).`);

        console.log('\n🚀 Database seeded successfully!');
        console.log('-------------------------------------------');
        console.log('Admin Email: admin@eventora.com');
        console.log('User Email:  user@eventora.com');
        console.log('Password for all users: password123');
        console.log('-------------------------------------------\n');

        if (!isProgrammatic) process.exit();
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        if (!isProgrammatic) process.exit(1);
    }
};

if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
