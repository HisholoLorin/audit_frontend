import { useEffect, useState, useCallback, useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SearchFilterSort,
  applySortAndFilter,
  type SortState,
} from '@/components/search-filter-sort'
import { MonthPicker } from '@/components/month-picker'

interface Income {
  id: number
  amount: number
  month: string
  source: string
  notes: string
}

const formSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  month: z.string().min(1, 'Month is required'),
  source: z.string().optional(),
  notes: z.string().optional(),
})

const SORT_OPTIONS = [
  { label: 'Month', value: 'month' },
  { label: 'Source', value: 'source' },
  { label: 'Amount', value: 'amount' },
]

export function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)

  // Search & sort state
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortState>({ field: 'month', direction: 'desc' })
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      month: new Date().toISOString().slice(0, 7),
      source: '',
      notes: '',
    },
  })

  const fetchIncomes = useCallback(async () => {
    try {
      const monthStr = format(currentMonth, 'yyyy-MM')
      const response = await api.get('/income/', { params: { month: monthStr } })
      setIncomes(response.data.results || response.data)
    } catch {
      toast.error('Failed to fetch income data')
    } finally {
      setLoading(false)
    }
  }, [currentMonth])

  useEffect(() => {
    fetchIncomes()
  }, [fetchIncomes])

  // Apply search and sort
  const filteredIncomes = useMemo(() => {
    return applySortAndFilter(incomes, search, ['source', 'notes', 'month'], sort)
  }, [incomes, search, sort])

  const handleAddNew = () => {
    setEditingIncome(null)
    form.reset({
      amount: '',
      month: new Date().toISOString().slice(0, 7),
      source: '',
      notes: '',
    })
    setDialogOpen(true)
  }

  const handleEdit = (income: Income) => {
    setEditingIncome(income)
    form.reset({
      amount: String(income.amount),
      month: income.month.slice(0, 7),
      source: income.source || '',
      notes: income.notes || '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/income/${id}/`)
      toast.success('Income entry deleted')
      fetchIncomes()
    } catch {
      toast.error('Failed to delete income entry')
    }
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const payload = {
      amount: parseFloat(data.amount),
      month: `${data.month}-01`,
      source: data.source || '',
      notes: data.notes || '',
    }

    try {
      if (editingIncome) {
        await api.put(`/income/${editingIncome.id}/`, payload)
        toast.success('Income updated')
      } else {
        await api.post('/income/', payload)
        toast.success('Income added')
      }
      setDialogOpen(false)
      fetchIncomes()
    } catch (error: any) {
      const msg = error.response?.data?.detail || error.response?.data?.month?.[0] || 'Failed to save income'
      toast.error(msg)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)

  return (
    <>
      <Header>
        <div className='me-auto'>
          <h1 className='text-lg font-semibold'>Income</h1>
        </div>
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>Monthly Income</h1>
          <Button onClick={handleAddNew}>
            <Plus className='mr-2 h-4 w-4' />
            Add Income
          </Button>
        </div>

        <SearchFilterSort
          searchPlaceholder='Search income…'
          searchValue={search}
          onSearchChange={setSearch}
          sortOptions={SORT_OPTIONS}
          sort={sort}
          onSortChange={setSort}
          descLabel='Newest First'
          ascLabel='Oldest First'
          rightContent={<MonthPicker date={currentMonth} onChange={setCurrentMonth} />}
        />

        <Card>
          <CardHeader>
            <CardTitle>Income History</CardTitle>
            <CardDescription>Your monthly income records</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='text-center py-8 text-muted-foreground'>Loading...</div>
            ) : filteredIncomes.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                {incomes.length === 0
                  ? 'No income entries yet. Click "Add Income" to set your monthly income.'
                  : 'No income entries match your search.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncomes.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell>
                        {new Date(income.month).toLocaleDateString('en-IN', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {income.source || <span className='italic'>—</span>}
                      </TableCell>
                      <TableCell className='text-right font-medium'>
                        {formatCurrency(income.amount)}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {income.notes || '-'}
                      </TableCell>
                      <TableCell className='text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon'>
                              <MoreHorizontal className='h-4 w-4' />
                              <span className='sr-only'>Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => handleEdit(income)}>
                              <Edit className='mr-2 h-4 w-4' />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant='destructive'
                              onClick={() => handleDelete(income.id)}
                            >
                              <Trash2 className='mr-2 h-4 w-4' />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>{editingIncome ? 'Edit Income' : 'Add Monthly Income'}</DialogTitle>
              <DialogDescription>
                {editingIncome ? 'Update your income for this month.' : 'Set your income for a month.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <FormField
                  control={form.control}
                  name='month'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <FormControl>
                        <Input type='month' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='source'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. Salary, Freelance, Bonus' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type='number' step='0.01' placeholder='50000' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='notes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder='e.g., includes bonus' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type='submit'>{editingIncome ? 'Update' : 'Add'} Income</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
