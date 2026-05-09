import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <h1 className="font-heading text-8xl md:text-9xl font-bold text-dark/10 leading-none">
          404
        </h1>
        <h2 className="font-heading text-2xl md:text-3xl font-semibold text-dark -mt-4 mb-4">
          Page not found
        </h2>
        <p className="text-black/50 text-base mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all"
          >
            <Home size={16} />
            Go home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-8 py-3.5 border border-black/10 text-dark rounded-full font-medium text-sm hover:bg-black/5 transition-all"
          >
            <ArrowLeft size={16} />
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}
