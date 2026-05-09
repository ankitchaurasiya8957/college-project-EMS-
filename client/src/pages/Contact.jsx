import { Phone, Mail, MapPin, Send } from 'lucide-react'
import SectionTag from '../components/SectionTag'

export default function Contact() {
  return (
    <div className="pt-28 pb-20">
      <section className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Header */}
        <div className="text-center mb-16">
          <SectionTag>Contact</SectionTag>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold text-dark leading-tight mt-4 tracking-tight">
            Get in touch
          </h1>
          <p className="text-black/50 text-base lg:text-lg mt-4 max-w-2xl mx-auto">
            Have questions about an event or need help with your booking? Our team is ready to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-black/10 hover:border-primary/20 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Phone size={20} className="text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-dark mb-2">Call us</h3>
              <p className="text-black/50 text-sm">+91-800-123-4567</p>
              <p className="text-black/50 text-sm">Mon-Fri, 9AM-6PM</p>
            </div>

            <div className="p-6 rounded-2xl border border-black/10 hover:border-primary/20 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Mail size={20} className="text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-dark mb-2">Email us</h3>
              <p className="text-black/50 text-sm">hello@eventora.com</p>
              <p className="text-black/50 text-sm">We reply within 24 hours</p>
            </div>

            <div className="p-6 rounded-2xl border border-black/10 hover:border-primary/20 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <MapPin size={20} className="text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-dark mb-2">Visit us</h3>
              <p className="text-black/50 text-sm">Mumbai</p>
              <p className="text-black/50 text-sm">Maharashtra, India</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-black/10 p-8 lg:p-12">
            <h2 className="font-heading text-2xl font-semibold text-dark mb-8">Send us a message</h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-dark block mb-2">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="w-full px-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark block mb-2">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full px-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-dark block mb-2">Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-dark block mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full px-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-dark block mb-2">Message</label>
                <textarea
                  rows={5}
                  placeholder="Tell us about your question..."
                  className="w-full px-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all"
              >
                <Send size={16} />
                Send message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
