import { useState, useEffect, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Phone, Menu, X, LogOut, LayoutDashboard, LogIn, UserPlus } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    navigate('/login')
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/#events' },
    ...(user
      ? [{ name: 'Dashboard', path: user.role === 'admin' ? '/admin' : '/dashboard' }]
      : []),
    { name: 'Contact', path: '/contact' },
  ]

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-out ${
        scrolled ? 'translate-y-6 px-4 md:px-8' : 'translate-y-0 px-0'
      }`}>
        <div className={`w-full transition-all duration-500 ease-out ${
          scrolled
            ? 'max-w-full bg-white rounded-full shadow-lg px-6 md:px-8 py-3'
            : `max-w-full px-6 md:px-12 lg:px-20 ${isHome ? 'bg-transparent py-6' : 'bg-white shadow-sm py-4'}`
        }`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className={`flex items-center justify-center transition-colors duration-500 ${(!isHome || scrolled) ? 'text-dark' : 'text-white'}`}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className={`text-2xl font-bold font-heading transition-colors duration-500 tracking-tight ${(!isHome || scrolled) ? 'text-dark' : 'text-white'}`}>
                Eventora
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className={`flex items-center gap-2 text-[15px] font-medium transition-colors duration-200 ${
                      (!isHome || scrolled) ? 'text-dark hover:text-primary' : 'text-white hover:text-white/80'
                    }`}
                  >
                    <LogIn size={16} />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[15px] font-medium transition-all duration-200 ${
                      (!isHome || scrolled)
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-white text-dark hover:bg-white/90'
                    }`}
                  >
                    <UserPlus size={16} />
                    Sign Up
                  </Link>
                </>
              ) : (
                <Link 
                  to="/profile" 
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-full transition-all duration-300 ${
                    (!isHome || scrolled) 
                      ? 'text-dark hover:bg-black/5' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff&bold=true`} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[15px] font-medium pr-2">{user.name.split(' ')[0]}</span>
                </Link>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-2.5 px-7 py-3 rounded-full text-[15px] font-medium transition-all duration-200 ${
                  (!isHome || scrolled)
                    ? 'bg-dark text-white hover:bg-dark/90'
                    : 'bg-white text-dark hover:bg-white/90'
                }`}
              >
                <Menu size={18} />
                Menu
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-full transition-colors ${(!isHome || scrolled) ? 'text-dark' : 'text-white'}`}
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Menu Overlay */}
      <div
        className={`fixed inset-0 bg-dark/60 backdrop-blur-sm transition-opacity duration-500 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{ zIndex: 90 }}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-[#1a2024] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-y-auto ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ zIndex: 100 }}
      >
        <div className="p-8 lg:p-12 flex-1 flex flex-col">
          {/* Close Button */}
          <div className="flex justify-start mb-16">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-dark hover:bg-gray-100 transition-colors shadow-sm"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col items-start gap-6">
            {navLinks.map((item) => {
              const isActive = item.path === '/' 
                ? location.pathname === '/' && location.hash === ''
                : item.path.includes('#')
                  ? location.pathname + location.hash === item.path
                  : location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-4 text-3xl md:text-4xl font-heading font-semibold transition-colors duration-300 ${
                    isActive ? 'text-[#00c18d]' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {isActive && <span className="w-6 h-[2px] bg-[#00c18d] rounded-full" />}
                  {item.name}
                </Link>
              )
            })}

            {/* Auth links in sidebar */}
            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 text-3xl md:text-4xl font-heading font-semibold text-white/50 hover:text-white transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 text-3xl md:text-4xl font-heading font-semibold text-white/50 hover:text-white transition-colors duration-300"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 text-3xl md:text-4xl font-heading font-semibold text-red-400/70 hover:text-red-400 transition-colors duration-300"
              >
                <LogOut size={28} />
                Logout
              </button>
            )}
          </nav>

          {/* Footer Info */}
          <div className="mt-auto pt-16 space-y-10">
            <div>
              <h4 className="text-white/40 font-medium text-sm mb-3">Contact</h4>
              <div className="space-y-2 text-white/90 text-[15px] font-medium">
                <p>hello@eventora.com</p>
                <p>+91-800-123-4567</p>
              </div>
            </div>
            <div>
              <h4 className="text-white/40 font-medium text-sm mb-3">Socials</h4>
              <div className="space-y-2 text-white/90 text-[15px] font-medium">
                <a href="#" className="block hover:text-white transition-colors">X / Twitter</a>
                <a href="#" className="block hover:text-white transition-colors">Facebook</a>
                <a href="#" className="block hover:text-white transition-colors">Instagram</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
