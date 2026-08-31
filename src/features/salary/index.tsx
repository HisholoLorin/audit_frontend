import { useEffect, useState, useCallback } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
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

interface Salary {
  id: number
  amount: number
  month: string
  notes: string
}

const formSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  month: z.string().min(1, 'Month is required'),
  notes: z.string().optional(),
})

export function SalaryPage() {
  const [salaries, setSalaries] = useState<Salary[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSalary, setEditingSalary] = useState<Salary | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      month: new Date().toISOString().slice(0, 7),
      notes: '',
    },
  })

  const fetchSalaries = useCallback(async () => {
    try {
      const response = await api.get('/salary/')
      setSalaries(response.data.results || response.data)
    } catch {
      toast.error('Failed to fetch salary data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSalaries()
  }, [fetchSalaries])

  const handleAddNew = () => {
    setEditingSalary(null)
    form.reset({
      amount: '',
      month: new Date().toISOString().slice(0, 7),
      notes: '',
    })
    setDialogOpen(true)
  }

  const handleEdit = (salary: Salary) => {
    setEditingSalary(salary)
    form.reset({
      amount: String(salary.amount),
      month: salary.month.slice(0, 7),
      notes: salary.notes || '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/salary/${id}/`)
      toast.success('Salary entry deleted')
      fetchSalaries()
    } catch {
      toast.error('Failed to delete salary entry')
    }
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const payload = {
      amount: parseFloat(data.amount),
      month: `${data.month}-01`,
      notes: data.notes || '',
    }

    try {
      if (editingSalary) {
        await api.put(`/salary/${editingSalary.id}/`, payload)
        toast.success('Salary updated')
      } else {
        await api.post('/salary/', payload)
        toast.success('Salary added')
      }
      setDialogOpen(false)
      fetchSalaries()
    } catch (error: any) {
      const msg = error.response?.data?.detail || error.response?.data?.month?.[0] || 'Failed to save salary'
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
          <h1 className='text-lg font-semibold'>Salary</h1>
        </div>
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>Monthly Salary</h1>
          <Button onClick={handleAddNew}>
            <Plus className='mr-2 h-4 w-4' />
            Add Salary
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Salary History</CardTitle>
            <CardDescription>Your monthly income records</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='text-center py-8 text-muted-foreground'>Loading...</div>
            ) : salaries.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                No salary entries yet. Click "Add Salary" to set your monthly income.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaries.map((salary) => (
                    <TableRow key={salary.id}>
                      <TableCell>
                        {new Date(salary.month).toLocaleDateString('en-IN', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className='text-right font-medium'>
                        {formatCurrency(salary.amount)}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {salary.notes || '-'}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button variant='ghost' size='sm' onClick={() => handleEdit(salary)}>Edit</Button>
                        <Button variant='ghost' size='sm' className='text-destructive' onClick={() => handleDelete(salary.id)}>Delete</Button>
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
              <DialogTitle>{editingSalary ? 'Edit Salary' : 'Add Monthly Salary'}</DialogTitle>
              <DialogDescription>
                {editingSalary ? 'Update your salary for this month.' : 'Set your income for a month.'}
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
                  <Button type='submit'>{editingSalary ? 'Update' : 'Add'} Salary</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
