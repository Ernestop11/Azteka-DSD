import { motion } from 'framer-motion'

export default function LoadingSpinner() {
  return (
    <motion.span
      className="inline-block h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent"
      aria-label="Loading"
      role="status"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
    />
  )
}
