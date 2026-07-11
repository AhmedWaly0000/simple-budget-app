import { Search, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

export default function SearchBar({ placeholder = 'Search players…' }) {
  const { filters, setFilter } = useAppStore()

  return (
    <div className="relative flex items-center">
      <Search size={15} className="absolute left-3 text-gray-500 pointer-events-none" />
      <input
        type="text"
        value={filters.search}
        onChange={(e) => setFilter('search', e.target.value)}
        placeholder={placeholder}
        className="input-field pl-9 pr-9"
      />
      {filters.search && (
        <button
          onClick={() => setFilter('search', '')}
          className="absolute right-3 text-gray-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
