interface SectionHeaderProps {
  title: string
  subtitle?: string
}

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-4 md:mb-6">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
      {subtitle && (
        <p className="text-sm md:text-base text-gray-600 mt-1">{subtitle}</p>
      )}
    </div>
  )
}
