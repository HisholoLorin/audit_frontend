import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface RecentExpensesProps {
  expenses: Array<{
    id: number
    title: string
    amount: number
    date: string
    category_name: string
  }>
  loading: boolean
}

export function RecentExpenses({ expenses, loading }: RecentExpensesProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return <div className='text-center text-muted-foreground py-8'>Loading...</div>
  }

  if (expenses.length === 0) {
    return <div className='text-center text-muted-foreground py-8'>No recent expenses</div>
  }

  return (
    <div className='space-y-6'>
      {expenses.map((expense) => (
        <div key={expense.id} className='flex items-center'>
          <Avatar className='h-9 w-9'>
            <AvatarFallback>
              {expense.category_name?.substring(0, 2).toUpperCase() || 'EX'}
            </AvatarFallback>
          </Avatar>
          <div className='ms-4 space-y-1'>
            <p className='text-sm font-medium leading-none'>{expense.title}</p>
            <p className='text-sm text-muted-foreground'>
              {expense.category_name} · {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </div>
          <div className='ms-auto font-medium text-destructive'>-{formatCurrency(expense.amount)}</div>
        </div>
      ))}
    </div>
  )
}
