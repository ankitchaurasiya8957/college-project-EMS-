import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Calendar, MapPin, Users, Clock, Ticket, ShieldCheck, Sparkles, Quote, ArrowLeft } from 'lucide-react';
import eventService from '../services/eventService';
import EventCard from '../components/EventCard';

function useInView(ref) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        observer.disconnect()
      }
    }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return inView
}

function AnimatedSection({ children, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref)
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  )
}

const testimonials = [
  {
    id: 1,
    text: 'Eventora made finding and booking events so effortless! The registration was seamless, OTP verification gave me confidence, and I got my confirmation instantly. Highly recommended for anyone looking for a stress-free booking experience!',
    name: 'Priya Sharma',
    role: 'Attendee',
  },
  {
    id: 2,
    text: 'As an event organizer, managing bookings through Eventora has been a game-changer. The admin dashboard is intuitive, payment tracking is clear, and the booking approval system gives us full control. Outstanding platform!',
    name: 'Rahul Verma',
    role: 'Event Organizer',
  },
]

const Home = () => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);

    const defaultSlides = [
        { 
            image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=3000&auto=format&fit=crop",
            title: "Unforgettable\nExperiences",
            subtitle: "Welcome to Eventora",
            isDefault: true
        },
        { 
            image: "https://images.unsplash.com/photo-1540511546927-13a341c0eb01?q=80&w=3000&auto=format&fit=crop",
            title: "Discover new\nAdventures",
            subtitle: "Welcome to Eventora",
            isDefault: true
        },
        { 
            image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=3000&auto=format&fit=crop",
            title: "Connect with\nCommunity",
            subtitle: "Welcome to Eventora",
            isDefault: true
        },
        { 
            image: "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?q=80&w=3000&auto=format&fit=crop",
            title: "Join the\nCelebration",
            subtitle: "Welcome to Eventora",
            isDefault: true
        }
    ];

    const slideEvents = events.length > 0
        ? events.filter(e => e.image).slice(0, 5).map(e => ({
            image: e.image,
            title: e.title,
            subtitle: e.category || "Featured Event",
            isDefault: false,
            event: e
        }))
        : [];
    
    const finalSlides = slideEvents.length > 0 ? slideEvents : defaultSlides;
    const currentSlideData = finalSlides.length > 0 ? finalSlides[currentSlide % finalSlides.length] : defaultSlides[0];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % finalSlides.length);
        }, 7000);
        return () => clearInterval(timer);
    }, [finalSlides.length]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEvents();
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const fetchEvents = async () => {
        try {
            const data = await eventService.getAll({ search });
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const featuredEvent = events.length > 0 ? events[0] : null;

    return (
        <div>
          {/* ==================== HERO SECTION ==================== */}
          <section className="relative h-screen min-h-[700px] flex items-end overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-black">
              {finalSlides.map((slide, index) => (
                <img
                  key={index}
                  src={slide.image}
                  alt={slide.title.replace('\n', ' ')}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                    index === currentSlide % finalSlides.length ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 pb-0">
              <div className="flex flex-col lg:flex-row items-end justify-between gap-8">
                {/* Left Content */}
                <div key={`left-${currentSlide}`} className="pb-12 lg:pb-16 animate-fade-in-up">
                  <p className="text-white/80 text-base md:text-lg font-medium mb-4">
                    {currentSlideData.subtitle}
                  </p>
                  <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-semibold text-white leading-[1.1] tracking-tight mb-8 max-w-4xl" title={currentSlideData.title.replace('\n', ' ')}>
                    {currentSlideData.title.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < currentSlideData.title.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4">
                    {currentSlideData.isDefault ? (
                      <>
                        <a
                          href="#events"
                          className="px-8 py-3.5 bg-white text-dark rounded-full font-medium text-sm hover:bg-white/90 transition-all duration-200"
                        >
                          Browse Events
                        </a>
                        <Link
                          to="/register"
                          className="px-8 py-3.5 border border-white text-white rounded-full font-medium text-sm hover:bg-white/10 transition-all duration-200"
                        >
                          Join Now
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to={`/events/${currentSlideData.event._id}`}
                          className="px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all duration-200"
                        >
                          Book Ticket
                        </Link>
                        <a
                          href="#events"
                          className="px-8 py-3.5 border border-white text-white rounded-full font-medium text-sm hover:bg-white/10 transition-all duration-200"
                        >
                          More Events
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Right - Stats Card */}
                <div key={`stats-${currentSlide}`} className="w-full lg:w-auto animate-fade-in-up -mr-6 md:-mr-12 lg:-mr-20" style={{ animationDelay: '0.2s' }}>
                  <div className="bg-white rounded-tl-[2.5rem] p-6 lg:px-12 lg:py-8 w-full shadow-2xl">
                    {currentSlideData.isDefault ? (
                      <div className="flex flex-wrap lg:flex-nowrap items-center gap-6 lg:gap-12">
                        <div className="flex items-center gap-3">
                          <Calendar size={24} className="text-black/40" />
                          <span className="text-base font-medium text-dark whitespace-nowrap">Live Events</span>
                        </div>
                        <div className="hidden lg:block h-12 w-px bg-black/10" />
                        <div className="flex items-center gap-3">
                          <Users size={24} className="text-black/40" />
                          <span className="text-base font-medium text-dark whitespace-nowrap">OTP Secured</span>
                        </div>
                        <div className="hidden lg:block h-12 w-px bg-black/10" />
                        <div className="flex items-center gap-3">
                          <ShieldCheck size={24} className="text-black/40" />
                          <span className="text-base font-medium text-dark whitespace-nowrap">Admin Verified</span>
                        </div>
                        <div className="hidden lg:block h-12 w-px bg-black/10" />
                        <div className="flex flex-col">
                          <p className="text-[1.75rem] font-medium text-dark leading-tight whitespace-nowrap">{events.length}+</p>
                          <p className="text-sm text-black/40 whitespace-nowrap">Active Events</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap lg:flex-nowrap items-center gap-6 lg:gap-12">
                        <div className="flex items-center gap-3">
                          <Calendar size={24} className="text-black/40" />
                          <div className="flex flex-col">
                            <span className="text-base font-medium text-dark whitespace-nowrap">
                              {new Date(currentSlideData.event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-xs text-black/40 whitespace-nowrap">Date</span>
                          </div>
                        </div>
                        <div className="hidden lg:block h-12 w-px bg-black/10" />
                        <div className="flex items-center gap-3">
                          <MapPin size={24} className="text-black/40" />
                          <div className="flex flex-col">
                            <span className="text-base font-medium text-dark whitespace-nowrap max-w-[150px] truncate">
                              {currentSlideData.event.location}
                            </span>
                            <span className="text-xs text-black/40 whitespace-nowrap">Location</span>
                          </div>
                        </div>
                        <div className="hidden lg:block h-12 w-px bg-black/10" />
                        <div className="flex items-center gap-3">
                          <Ticket size={24} className="text-black/40" />
                          <div className="flex flex-col">
                            <span className="text-base font-medium text-dark whitespace-nowrap">
                              {currentSlideData.event.ticketPrice === 0 ? 'Free' : `₹${currentSlideData.event.ticketPrice}`}
                            </span>
                            <span className="text-xs text-black/40 whitespace-nowrap">Price</span>
                          </div>
                        </div>
                        <div className="hidden lg:block h-12 w-px bg-black/10" />
                        <div className="flex flex-col">
                          <p className="text-[1.75rem] font-medium text-dark leading-tight whitespace-nowrap">{currentSlideData.event.availableSeats}</p>
                          <p className="text-sm text-black/40 whitespace-nowrap">Seats Left</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== WHY CHOOSE US ==================== */}
          <AnimatedSection>
            <section className="py-20 lg:py-32 bg-white overflow-hidden">
              <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                  {/* Left - Text */}
                  <div>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-dark leading-tight mt-4 tracking-tight">
                      Discover events with<br className="hidden lg:block" /> seamless booking.
                    </h2>
                    <p className="text-black/50 text-base lg:text-lg mt-6 max-w-lg leading-relaxed">
                      From tech conferences to music festivals, we bring the best experiences to your fingertips with secure, verified booking.
                    </p>
                    <a
                      href="#events"
                      className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all duration-200"
                    >
                      Explore events
                    </a>
                  </div>

                  {/* Right - Feature Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: Clock, title: 'Fast Booking', desc: 'Secure your tickets instantly with our streamlined booking flow.' },
                      { icon: Ticket, title: 'Seamless Access', desc: 'Manage bookings right from your personal dashboard.' },
                      { icon: ShieldCheck, title: 'OTP Secured', desc: 'Every booking is verified with a 2FA OTP for maximum security.' },
                      { icon: Users, title: 'Admin Verified', desc: 'All bookings are manually reviewed and confirmed by organizers.' },
                    ].map((feature, i) => (
                      <div
                        key={i}
                        className="p-6 rounded-2xl border border-black/10 hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                          <feature.icon size={22} className="text-primary" />
                        </div>
                        <h3 className="font-heading font-semibold text-dark mb-2">{feature.title}</h3>
                        <p className="text-sm text-black/50 leading-relaxed">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </AnimatedSection>

          {/* ==================== EVENTS LISTING ==================== */}
          <AnimatedSection>
            <section id="events" className="py-20 lg:py-32 bg-white">
              <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                  <div>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-dark leading-tight mt-4 tracking-tight">
                      Upcoming experiences.
                    </h2>
                    <p className="text-black/50 text-base lg:text-lg mt-4">
                      Curated events where excitement, learning, and fun come together.
                    </p>
                  </div>
                </div>

                {/* Search */}
                <div className="mb-10">
                  <div className="relative max-w-lg">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                    <input
                      type="text"
                      placeholder="Search events by title..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-full border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Grid */}
                {loading ? (
                  <div className="text-center py-20">
                    <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-black/50 mt-4">Loading events...</p>
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-black/50 text-lg">No events found matching your search.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                    {events.map((event) => (
                      <EventCard key={event._id} event={event} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </AnimatedSection>

          {/* ==================== FEATURED EVENT ==================== */}
          {featuredEvent && (
            <AnimatedSection>
              <section className="py-20 lg:py-32 bg-white">
                <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* Left - Image */}
                    <div className="relative rounded-2xl overflow-hidden min-h-[400px] lg:min-h-[600px]">
                      {featuredEvent.image ? (
                        <img src={featuredEvent.image} alt={featuredEvent.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-dark to-dark/70 flex items-center justify-center">
                          <span className="text-white/20 text-6xl font-heading font-bold">{featuredEvent.category}</span>
                        </div>
                      )}
                    </div>

                    {/* Right - Info */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-dark mt-4 tracking-tight">
                          {featuredEvent.title}
                        </h2>
                        <div className="flex items-center gap-2 mt-3 text-black/50">
                          <MapPin size={16} />
                          <span className="text-sm">{featuredEvent.location}</span>
                        </div>
                        <p className="text-black/50 text-base leading-relaxed mt-6">
                          {featuredEvent.description}
                        </p>

                        {/* Features */}
                        <div className="mt-8 space-y-6">
                          {[
                            { title: 'Verified Booking', description: 'Every registration is OTP-verified for maximum security.' },
                            { title: 'Admin Confirmed', description: 'Bookings are reviewed and approved by event organizers.' },
                            { title: 'Live Tracking', description: 'Real-time seat availability tracking and status updates.' },
                          ].map((feature, i) => (
                            <div key={i} className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Sparkles size={18} className="text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-dark">{feature.title}</h4>
                                <p className="text-sm text-black/50 mt-1">{feature.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom CTA */}
                      <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/10">
                        <Link
                          to={`/events/${featuredEvent._id}`}
                          className="px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all"
                        >
                          Book Now
                        </Link>
                        <div>
                          <p className="text-2xl font-medium text-dark">
                            {featuredEvent.ticketPrice === 0 ? 'Free' : `₹${featuredEvent.ticketPrice}`}
                          </p>
                          <p className="text-sm text-black/50">{featuredEvent.availableSeats} seats left</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </AnimatedSection>
          )}

          {/* ==================== TESTIMONIALS ==================== */}
          <AnimatedSection>
            <section className="py-20 lg:py-32 bg-[#1a1a1a] overflow-hidden">
              <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Left */}
                  <div>
                    <div className="flex items-start justify-between mb-10">
                      <div>
                        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight mt-4 tracking-tight">
                          What our users say
                        </h2>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        >
                          <ArrowLeft size={18} />
                        </button>
                        <button
                          onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        >
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Testimonial Content */}
                    <div className="relative">
                      <Quote size={48} className="text-white/10 mb-6" />
                      <p className="text-white text-lg lg:text-xl leading-relaxed">
                        {testimonials[currentTestimonial].text}
                      </p>
                      <div className="mt-8">
                        <p className="font-medium text-white">{testimonials[currentTestimonial].name}</p>
                        <p className="text-sm text-white/40 mt-1">{testimonials[currentTestimonial].role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right - Decorative */}
                  <div className="rounded-2xl overflow-hidden h-[400px] lg:h-[500px] bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                        <Quote size={40} className="text-white/50" />
                      </div>
                      <p className="text-white/30 text-lg font-heading font-semibold">Trusted by 1000+</p>
                      <p className="text-white/20 text-sm mt-1">event enthusiasts</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </AnimatedSection>

          {/* ==================== CTA BANNER ==================== */}
          <AnimatedSection>
            <section className="py-20 lg:py-32 bg-white">
              <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
                <div className="relative rounded-3xl overflow-hidden min-h-[500px] flex flex-col justify-between">
                  <img
                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=3000&auto=format&fit=crop"
                    alt="Event Celebration"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/40 to-dark/20" />

                  {/* Text Content */}
                  <div className="relative z-10 p-8 lg:p-16 flex-1 flex items-center">
                    <div>
                      <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight tracking-tight max-w-2xl">
                        Enter a realm where unforgettable experiences and lasting memories come together.
                      </h2>
                      <Link
                        to="/register"
                        className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-white text-dark rounded-full font-medium text-sm hover:bg-white/90 transition-all"
                      >
                        Get started
                      </Link>
                    </div>
                  </div>

                  {/* Marquee */}
                  <div className="relative z-10 bg-primary py-3 overflow-hidden">
                    <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-8 text-sm text-white">
                          <span>Discover amazing events in your city!</span>
                          <span className="w-px h-3 bg-white/50" />
                          <span>Secure OTP-verified booking with instant confirmation!</span>
                          <span className="w-px h-3 bg-white/50" />
                          <span>Get early access to exclusive events and workshops!</span>
                          <span className="w-px h-3 bg-white/50" />
                          <span>Join thousands of event enthusiasts on Eventora!</span>
                          <span className="w-px h-3 bg-white/50" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </AnimatedSection>
        </div>
    );
};

export default Home;
