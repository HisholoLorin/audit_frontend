import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { type Expense } from '../data/schema'

interface ExpenseTableProps {
  data: Expense[]
  loading: boolean
  onEdit: (expense: Expense) => void
  onDelete: (id: number) => void
}

export function ExpenseTable({ data, loading, onEdit, onDelete }: ExpenseTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return <div className='text-center py-8 text-muted-foreground'>Loading expenses...</div>
  }

  if (data.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        No expenses yet. Click "Add Expense" to get started.
      </div>
    )
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className='text-right'>Amount</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>
                {new Date(expense.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell className='font-medium'>{expense.title}</TableCell>
              <TableCell>
                <span className='flex items-center gap-2'>
                  {expense.category_color && (
                    <span
                      className='inline-block h-3 w-3 rounded-full shrink-0'
                      style={{ backgroundColor: expense.category_color }}
                    />
                  )}
                  {expense.category_name || 'Uncategorized'}
                </span>
              </TableCell>
              <TableCell className='text-right font-medium'>
                {formatCurrency(expense.amount)}
              </TableCell>
              <TableCell className='text-right'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => onEdit(expense)}
                >
                  <Edit className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => onDelete(expense.id)}
                >
                  <Trash2 className='h-4 w-4 text-destructive' />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
