import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, Clock, Ticket, ShieldCheck, Sparkles, Quote, ArrowLeft, Briefcase, GraduationCap, Music, Trophy, Heart, Leaf, Monitor, ChevronRight } from 'lucide-react';
import eventService from '../services/eventService';
import { EVENT_CATEGORIES, getCategoryConfig } from '../utils/categories';


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

    // BUG-13 FIX: Use ref for slide count so interval callback always sees latest value
    const slidesCountRef = useRef(finalSlides.length);
    useEffect(() => {
        slidesCountRef.current = finalSlides.length;
        // Bound currentSlide if slides array shrank
        setCurrentSlide(prev => prev >= finalSlides.length ? 0 : prev);
    }, [finalSlides.length]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slidesCountRef.current);
        }, 7000);
        return () => clearInterval(timer);
    }, []); // Only created once — no interval leak

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const data = await eventService.getAll();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div>
          {/* ==================== HERO SECTION ==================== */}
          <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
            </div>

            {/* Center Content */}
            <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
              <div key={`hero-${currentSlide}`} className="animate-fade-in-up">
                <p className="text-white/70 text-sm font-semibold uppercase tracking-[0.2em] mb-5">
                  {currentSlideData.subtitle}
                </p>
                <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-8" title={currentSlideData.title.replace('\n', ' ')}>
                  {currentSlideData.title.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < currentSlideData.title.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {currentSlideData.isDefault ? (
                    <>
                      <a
                        href="/events"
                        className="px-8 py-3.5 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/30"
                      >
                        Book Ticket
                      </a>
                      <Link
                        to="/events"
                        className="px-8 py-3.5 border border-white/40 text-white rounded-full font-semibold text-sm hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                      >
                        More Events
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to={`/events/${currentSlideData.event._id}`}
                        className="px-8 py-3.5 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/30"
                      >
                        Book Ticket
                      </Link>
                      <a
                        href="/events"
                        className="px-8 py-3.5 border border-white/40 text-white rounded-full font-semibold text-sm hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                      >
                        More Events
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Slide Indicator Dots */}
              <div className="flex items-center justify-center gap-2 mt-10">
                {finalSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentSlide % finalSlides.length
                        ? 'w-8 h-2.5 bg-primary'
                        : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Stats Bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-3xl px-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 px-6 py-4 shadow-2xl">
                {currentSlideData.isDefault ? (
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Calendar size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">Live Events</p>
                        <p className="text-white/50 text-xs">Happening now</p>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden md:block" />
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <ShieldCheck size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">OTP Secured</p>
                        <p className="text-white/50 text-xs">Verified booking</p>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden md:block" />
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <Ticket size={18} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">₹FREE+</p>
                        <p className="text-white/50 text-xs">Starting from</p>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden md:block" />
                    {/* Counter Circle */}
                    <div className="w-14 h-14 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-lg">{events.length}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Calendar size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">
                          {new Date(currentSlideData.event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-white/50 text-xs">Event Date</p>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden md:block" />
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Users size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">Guest Access, Yes</p>
                        <p className="text-white/50 text-xs">Open to all</p>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden md:block" />
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <Ticket size={18} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">
                          {currentSlideData.event.ticketPrice === 0 ? 'FREE' : `₹${currentSlideData.event.ticketPrice}`}
                        </p>
                        <p className="text-white/50 text-xs">Price</p>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden md:block" />
                    {/* Seats Counter Circle */}
                    <div className="w-14 h-14 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-lg">{currentSlideData.event.availableSeats}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ==================== BROWSE BY CATEGORY ==================== */}
          <AnimatedSection>
            <section className="py-20 lg:py-28 bg-white overflow-hidden">
              <div className="max-w-6xl mx-auto px-6 md:px-12">
                {/* Section Header */}
                <div className="flex items-end justify-between mb-12">
                  <div>
                    <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Explore Categories</p>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] font-semibold text-dark leading-tight tracking-tight">
                      Browse by Category
                    </h2>
                    <p className="text-black/50 text-base mt-3 max-w-xl leading-relaxed">
                      From corporate summits to music festivals — find your next experience across 14 curated event types.
                    </p>
                  </div>
                  <Link
                    to="/events"
                    className="hidden md:inline-flex items-center gap-2 px-6 py-3 border border-black/10 text-dark rounded-full font-semibold text-sm hover:bg-black/5 transition-all duration-200 shrink-0"
                  >
                    View All <ChevronRight size={16} />
                  </Link>
                </div>

                {/* Category Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                  {EVENT_CATEGORIES.map((cat, i) => {
                    const iconMap = { Briefcase, GraduationCap, Music, Trophy, Monitor, Heart, Leaf };
                    const IconComponent = iconMap[cat.icon] || Calendar;
                    const eventCount = events.filter(e => e.category === cat.value).length;
                    return (
                      <Link
                        key={cat.value}
                        to={`/events?category=${encodeURIComponent(cat.value)}`}
                        className="group relative p-5 rounded-2xl border border-black/5 hover:border-transparent hover:shadow-xl transition-all duration-300 overflow-hidden text-center"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        {/* Hover gradient background */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                          style={{ background: `linear-gradient(135deg, ${cat.bgColor}, white)` }}
                        />
                        <div className="relative z-10">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110"
                            style={{ backgroundColor: cat.bgColor, color: cat.color }}
                          >
                            <IconComponent size={22} />
                          </div>
                          <h3 className="font-heading font-semibold text-sm text-dark leading-snug">{cat.shortLabel}</h3>
                          <p className="text-[11px] text-black/40 mt-1 font-medium">
                            {eventCount > 0 ? `${eventCount} event${eventCount > 1 ? 's' : ''}` : 'Coming soon'}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 text-center md:hidden">
                  <Link
                    to="/events"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    Browse All Events <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </section>
          </AnimatedSection>

          {/* ==================== WHY CHOOSE US ==================== */}
          <AnimatedSection>
            <section className="py-20 lg:py-28 bg-white overflow-hidden">
              <div className="max-w-5xl mx-auto px-6 md:px-12">
                {/* Centered Header */}
                <div className="text-center mb-14">
                  <h2 className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] font-semibold text-dark leading-tight tracking-tight">
                    Discover events with seamless booking.
                  </h2>
                  <p className="text-black/50 text-base mt-4 max-w-xl mx-auto leading-relaxed">
                    From tech conferences to music festivals, we bring the best experiences to your fingertips with secure, verified booking.
                  </p>
                  <a
                    href="/events"
                    className="inline-flex items-center gap-2 mt-6 px-8 py-3 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20"
                  >
                    Explore events
                  </a>
                </div>

                {/* Feature Cards - 3 top row, 1 centered below */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
                  {[
                    { icon: Clock, title: 'Fast Booking', desc: 'Secure your tickets instantly with our streamlined booking flow.' },
                    { icon: Ticket, title: 'Seamless Access', desc: 'Manage bookings right from your personal dashboard.' },
                    { icon: ShieldCheck, title: 'OTP Secured', desc: 'Every booking is verified with a 2FA OTP for maximum security.' },
                  ].map((feature, i) => (
                    <div
                      key={i}
                      className="p-6 rounded-2xl border border-black/8 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group bg-white text-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                        <feature.icon size={22} className="text-primary" />
                      </div>
                      <h3 className="font-heading font-semibold text-dark mb-2">{feature.title}</h3>
                      <p className="text-sm text-black/50 leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
                {/* Centered 4th card */}
                <div className="max-w-xs mx-auto">
                  <div className="p-6 rounded-2xl border border-black/8 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group bg-white text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <Users size={22} className="text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold text-dark mb-2">Admin Verified</h3>
                    <p className="text-sm text-black/50 leading-relaxed">All bookings are manually reviewed and confirmed by organizers.</p>
                  </div>
                </div>
              </div>
            </section>
          </AnimatedSection>

          {/* ==================== MEET THE VISIONARIES ==================== */}
          <AnimatedSection>
            <section className="py-20 lg:py-28 bg-[#f8f9fa]">
              <div className="max-w-6xl mx-auto px-6 md:px-12">
                {/* Centered Header */}
                <div className="text-center mb-14">
                  <h2 className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] font-semibold text-dark leading-tight tracking-tight">
                    Meet the Visionaries
                  </h2>
                  <p className="text-black/50 text-base mt-4 max-w-2xl mx-auto leading-relaxed">
                    The architects behind the immersive experiences. A team dedicated to blending high-end design with seamless operational efficiency.
                  </p>
                </div>

                {/* Team Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: 'MOHD TAUHEED ANSARI',
                      role: 'FRONTEND DEVELOPER',
                      roleColor: 'text-primary',
                      image: '/team/tauheed.png',
                      desc: 'Architecting seamless workflows and driving strategic growth for premium event executions worldwide.',
                      showSocial: true,
                      instagram: 'https://www.instagram.com/absolute_tauheed',
                      linkedin: 'https://www.linkedin.com/in/mohd-tauheed-ansari',
                    },
                    {
                      name: 'ARPIT PANDEY',
                      role: 'DATABASE DEVELOPER',
                      roleColor: 'text-emerald-600',
                      image: '/team/arpit.png',
                      desc: 'Defining the visual language and experiential design for unforgettable, immersive events.',
                      showSocial: true,
                      instagram: 'https://www.instagram.com/arpit_pandey_0454?igsh=bXdmazF6dGgzaDc0',
                      linkedin: 'https://www.linkedin.com/in/arpit-pandey0454',
                    },
                    {
                      name: 'ANKIT CHAURASIYA',
                      role: 'BACKEND DEVELOPER',
                      roleColor: 'text-purple-600',
                      image: '/team/ankit.png',
                      desc: 'Ensuring flawless execution and precise coordination across global venue locations.',
                      showSocial: true,
                      instagram: 'https://www.instagram.com/mr.ankit84ya',
                      linkedin: 'https://www.linkedin.com/in/ankit-chaurasiya',
                    },
                  ].map((member, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-8 border border-black/5 hover:shadow-xl transition-all duration-300 text-center group"
                    >
                      {/* Circular Photo */}
                      <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden bg-gray-100 ring-4 ring-gray-50 group-hover:ring-primary/10 transition-all duration-300">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>

                      {/* Name & Role */}
                      <h3 className="font-heading text-lg font-semibold text-dark">{member.name}</h3>
                      <p className={`text-xs font-bold uppercase tracking-[0.15em] mt-1 ${member.roleColor}`}>
                        {member.role}
                      </p>

                      {/* Description */}
                      <p className="text-sm text-black/50 leading-relaxed mt-4">
                        {member.desc}
                      </p>

                      {/* Social Icons (only on first card as shown in image) */}
                      {member.showSocial && (
                        <div className="flex items-center justify-center gap-3 mt-6">
                          <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center text-black/40 hover:text-pink-500 hover:border-pink-500/30 transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                          </a>
                          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center text-black/40 hover:text-[#0A66C2] hover:border-[#0A66C2]/30 transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </AnimatedSection>

          {/* ==================== TESTIMONIALS ==================== */}
          <AnimatedSection>
            <section className="py-20 lg:py-28 bg-white overflow-hidden">
              <div className="max-w-5xl mx-auto px-6 md:px-12">
                {/* Centered Header */}
                <div className="text-center mb-12">
                  <h2 className="font-heading text-3xl md:text-4xl font-semibold text-dark leading-tight tracking-tight">
                    What our users say
                  </h2>
                  {/* Navigation Dots */}
                  <div className="flex items-center justify-center gap-2 mt-5">
                    {testimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentTestimonial(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          i === currentTestimonial ? 'bg-dark w-7' : 'bg-black/20 hover:bg-black/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Testimonial Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" key={`testimonial-${currentTestimonial}`} style={{ animation: 'fadeIn 0.4s ease-out' }}>
                  {/* Left - Quote */}
                  <div className="relative">
                    <Quote size={48} className="text-primary/15 mb-6" />
                    <p className="text-dark text-lg lg:text-xl leading-relaxed font-medium">
                      {testimonials[currentTestimonial].text}
                    </p>
                    <div className="mt-8">
                      <p className="font-semibold text-dark">{testimonials[currentTestimonial].name}</p>
                      <p className="text-sm text-black/40 mt-0.5">{testimonials[currentTestimonial].role}</p>
                    </div>
                  </div>

                  {/* Right - Decorative Circle */}
                  <div className="flex items-center justify-center">
                    <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center relative">
                      <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-full bg-gradient-to-br from-primary/15 to-transparent flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Quote size={28} className="text-primary/50" />
                          </div>
                          <p className="text-dark/60 text-sm font-semibold">Trusted by 14,000+</p>
                          <p className="text-black/30 text-xs mt-0.5">event enthusiasts</p>
                        </div>
                      </div>
                      {/* Floating dots */}
                      <div className="absolute top-6 right-10 w-3 h-3 rounded-full bg-primary/30 animate-pulse" />
                      <div className="absolute bottom-10 left-6 w-2 h-2 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: '1s' }} />
                      <div className="absolute top-1/2 right-2 w-2 h-2 rounded-full bg-primary/25 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </AnimatedSection>

          {/* ==================== CTA BANNER ==================== */}
          <AnimatedSection>
            <section className="py-16 lg:py-20 bg-white">
              <div className="max-w-6xl mx-auto px-6 md:px-12">
                <div className="relative rounded-3xl overflow-hidden min-h-[500px] flex flex-col justify-between">
                  <img
                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=3000&auto=format&fit=crop"
                    alt="Event Celebration"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/50 to-dark/30" />

                  {/* Text Content */}
                  <div className="relative z-10 p-8 lg:p-14 flex-1 flex items-center">
                    <div>
                      <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight max-w-2xl">
                        Enter a realm where unforgettable experiences and lasting memories come together.
                      </h2>
                      <Link
                        to="/register"
                        className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-white text-dark rounded-full font-semibold text-sm hover:bg-white/90 transition-all shadow-xl"
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
