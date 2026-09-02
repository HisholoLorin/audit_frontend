import { useState, useEffect } from 'react'
import { addMonths, subMonths, format, setMonth, setYear } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface MonthPickerProps {
  date: Date
  onChange: (date: Date) => void
  className?: string
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export function MonthPicker({ date, onChange, className }: MonthPickerProps) {
  const [open, setOpen] = useState(false)
  const [popoverYear, setPopoverYear] = useState(date.getFullYear())

  useEffect(() => {
    if (open) {
      setPopoverYear(date.getFullYear())
    }
  }, [open, date])

  return (
    <div className={cn('flex items-center rounded-md border bg-background', className)}>
      <Button
        variant='ghost'
        size='icon'
        className='h-9 w-9 rounded-r-none hover:bg-accent'
        onClick={() => onChange(subMonths(date, 1))}
      >
        <ChevronLeft className='h-4 w-4' />
      </Button>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant='ghost' 
            className='flex h-9 min-w-[160px] items-center justify-center gap-2 rounded-none border-x px-3 text-sm font-medium hover:bg-accent'
          >
            <CalendarIcon className='h-4 w-4 text-muted-foreground' />
            {format(date, 'MMMM yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-64 p-3' align='center'>
          <div className='mb-4 flex items-center justify-between'>
            <Button 
              variant='outline' 
              size='icon' 
              className='h-7 w-7' 
              onClick={() => setPopoverYear((y) => y - 1)}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <div className='text-sm font-semibold'>{popoverYear}</div>
            <Button 
              variant='outline' 
              size='icon' 
              className='h-7 w-7' 
              onClick={() => setPopoverYear((y) => y + 1)}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
          <div className='grid grid-cols-3 gap-2'>
            {MONTHS.map((m, i) => {
              const isSelected = date.getMonth() === i && date.getFullYear() === popoverYear
              return (
                <Button
                  key={m}
                  variant={isSelected ? 'default' : 'ghost'}
                  className='h-9 w-full text-sm'
                  onClick={() => {
                    let newDate = setYear(date, popoverYear)
                    newDate = setMonth(newDate, i)
                    onChange(newDate)
                    setOpen(false)
                  }}
                >
                  {m}
                </Button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
      
      <Button
        variant='ghost'
        size='icon'
        className='h-9 w-9 rounded-l-none hover:bg-accent'
        onClick={() => onChange(addMonths(date, 1))}
      >
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  )
}
