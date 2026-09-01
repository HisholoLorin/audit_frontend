import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { type Expense, type Category } from '../data/schema'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.string().min(1, 'Amount is required'),
  date: z.string().min(1, 'Date is required'),
  category: z.string().optional(),
  description: z.string().optional(),
})

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: Expense | null
  categories: Category[]
  onSave: (data: Partial<Expense>) => void
}

export function ExpenseDialog({
  open,
  onOpenChange,
  expense,
  categories,
  onSave,
}: ExpenseDialogProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
    },
  })

  useEffect(() => {
    if (expense) {
      form.reset({
        title: expense.title,
        amount: String(expense.amount),
        date: expense.date,
        category: expense.category ? String(expense.category) : '',
        description: expense.description || '',
      })
    } else {
      form.reset({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
      })
    }
  }, [expense, form])

  function onSubmit(data: z.infer<typeof formSchema>) {
    onSave({
      title: data.title,
      amount: parseFloat(data.amount),
      date: data.date,
      category: data.category ? parseInt(data.category) : null,
      description: data.description || '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          <DialogDescription>
            {expense ? 'Update the expense details.' : 'Add a new expense to track your spending.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* Title */}
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., Grocery shopping' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type='number' step='0.01' placeholder='0.00' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date — calendar icon on the right end */}
            <FormField
              control={form.control}
              name='date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          className={cn(
                            'w-full justify-between text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <span>
                            {field.value
                              ? format(new Date(field.value), 'dd MMM yyyy')
                              : 'Pick a date'}
                          </span>
                          <CalendarIcon className='h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, 'yyyy-MM-dd'))
                          }
                          setCalendarOpen(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category — searchable combobox with color dot */}
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => {
                const selectedCat = categories.find(
                  (c) => String(c.id) === field.value
                )
                return (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            role='combobox'
                            className={cn(
                              'w-full justify-between font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <span className='flex items-center gap-2'>
                              {selectedCat ? (
                                <>
                                  <span
                                    className='inline-block h-3 w-3 rounded-full shrink-0'
                                    style={{ backgroundColor: selectedCat.color }}
                                  />
                                  {selectedCat.name}
                                </>
                              ) : (
                                'Search category…'
                              )}
                            </span>
                            <ChevronsUpDown className='h-4 w-4 opacity-50 shrink-0' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-[375px] p-0' align='start'>
                        <Command>
                          <CommandInput placeholder='Search categories…' />
                          <CommandList>
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              {categories.map((cat) => (
                                <CommandItem
                                  key={cat.id}
                                  value={cat.name}
                                  onSelect={() => {
                                    field.onChange(
                                      field.value === String(cat.id) ? '' : String(cat.id)
                                    )
                                    setCategoryOpen(false)
                                  }}
                                >
                                  <span
                                    className='inline-block h-3 w-3 rounded-full shrink-0'
                                    style={{ backgroundColor: cat.color }}
                                  />
                                  <span>{cat.name}</span>
                                  <Check
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      field.value === String(cat.id)
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Add any notes...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='submit'>
                {expense ? 'Update' : 'Add'} Expense
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
