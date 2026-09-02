import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, ArrowUpDown, ArrowDown, ArrowUp, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface SortOption {
  label: string
  value: string
}

export interface SortState {
  field: string
  direction: 'asc' | 'desc'
}

interface SearchFilterSortProps {
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  sortOptions: SortOption[]
  sort: SortState
  onSortChange: (sort: SortState) => void
  ascLabel?: string
  descLabel?: string
  children?: React.ReactNode
  rightContent?: React.ReactNode
}

// Debounced search input
function DebouncedSearch({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string
  value: string
  onChange: (value: string) => void
}) {
  const [localValue, setLocalValue] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = useCallback(
    (val: string) => {
      setLocalValue(val)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        onChange(val)
      }, 300)
    },
    [onChange]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleClear = () => {
    setLocalValue('')
    if (timerRef.current) clearTimeout(timerRef.current)
    onChange('')
  }

  return (
    <div className='relative w-full sm:w-64'>
      <Search className='absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        className='h-9 pl-9'
      />
      {localValue && (
        <Button
          variant='ghost'
          size='icon'
          className='absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2'
          onClick={handleClear}
        >
          <X className='h-3.5 w-3.5' />
        </Button>
      )}
    </div>
  )
}

export function SearchFilterSort({
  searchPlaceholder = 'Search…',
  searchValue,
  onSearchChange,
  sortOptions,
  sort,
  onSortChange,
  ascLabel = 'A → Z',
  descLabel = 'Z → A',
  children,
  rightContent,
}: SearchFilterSortProps) {
  const currentSortLabel = sortOptions.find((o) => o.value === sort.field)?.label || 'Sort'

  return (
    <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex flex-wrap items-center gap-3'>
        {/* Debounced Search */}
        <DebouncedSearch
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={onSearchChange}
        />

        {/* Extra filters (slot) */}
        {children}

        {/* Sort popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' size='sm' className='h-9 gap-1.5'>
              <ArrowUpDown className='h-3.5 w-3.5' />
              Sort: {currentSortLabel}
            </Button>
          </PopoverTrigger>
        <PopoverContent className='w-64 p-0' align='end'>
          <div className='p-4'>
            {/* Sort By */}
            <p className='mb-2.5 text-xs font-semibold tracking-wider text-muted-foreground'>
              SORT BY
            </p>
            <RadioGroup
              value={sort.field}
              onValueChange={(value) => onSortChange({ ...sort, field: value })}
              className='gap-2'
            >
              {sortOptions.map((opt) => (
                <div key={opt.value} className='flex items-center gap-2'>
                  <RadioGroupItem value={opt.value} id={`sort-${opt.value}`} />
                  <Label htmlFor={`sort-${opt.value}`} className='cursor-pointer text-sm font-normal'>
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Order */}
            <p className='mb-2.5 mt-5 text-xs font-semibold tracking-wider text-muted-foreground'>
              ORDER
            </p>
            <div className='flex flex-col gap-2'>
              <button
                type='button'
                onClick={() => onSortChange({ ...sort, direction: 'desc' })}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                  sort.direction === 'desc'
                    ? 'border-primary bg-primary/5 font-medium text-primary'
                    : 'border-border text-muted-foreground hover:bg-accent'
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                    sort.direction === 'desc'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <ArrowDown className='h-3.5 w-3.5' />
                </span>
                {descLabel}
              </button>
              <button
                type='button'
                onClick={() => onSortChange({ ...sort, direction: 'asc' })}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                  sort.direction === 'asc'
                    ? 'border-primary bg-primary/5 font-medium text-primary'
                    : 'border-border text-muted-foreground hover:bg-accent'
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                    sort.direction === 'asc'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <ArrowUp className='h-3.5 w-3.5' />
                </span>
                {ascLabel}
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      </div>

      {rightContent && (
        <div className='flex items-center gap-3'>
          {rightContent}
        </div>
      )}
    </div>
  )
}

// Helper to sort and filter data client-side
export function applySortAndFilter<T>(
  data: T[],
  searchValue: string,
  searchFields: (keyof T)[],
  sort: SortState,
): T[] {
  let filtered = data

  // Search filter
  if (searchValue.trim()) {
    const query = searchValue.toLowerCase()
    filtered = filtered.filter((item) =>
      searchFields.some((field) => {
        const val = item[field]
        if (val == null) return false
        return String(val).toLowerCase().includes(query)
      })
    )
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sort.field as keyof T]
    const bVal = b[sort.field as keyof T]

    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    let comparison: number
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal
    } else {
      comparison = String(aVal).localeCompare(String(bVal))
    }

    return sort.direction === 'desc' ? -comparison : comparison
  })

  return sorted
}
