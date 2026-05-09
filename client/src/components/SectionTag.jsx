import { Sparkles } from 'lucide-react'

export default function SectionTag({ children, light = false }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
      light ? 'text-white' : 'text-dark'
    }`}>
      <Sparkles size={14} className={light ? 'text-white' : 'text-primary'} />
      {children}
    </div>
  )
}
