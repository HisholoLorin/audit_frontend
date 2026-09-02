import { useState } from 'react'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  List,
  CalendarIcon,
  Check,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Expense, type Category } from '../data/schema'

interface EditState {
  title: string
  amount: string
  date: string
  category: string
}

interface ExpenseTableProps {
  data: Expense[]
  loading: boolean
  categories: Category[]
  onSave: (id: number, data: Partial<Expense>) => void
  onDelete: (id: number) => void
  onBreakdown: (expense: Expense) => void
  breakdownExpenseId: number | null
  breakdownForm: React.ReactNode | null
}

export function ExpenseTable({
  data,
  loading,
  categories,
  onSave,
  onDelete,
  onBreakdown,
  breakdownExpenseId,
  breakdownForm,
}: ExpenseTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editState, setEditState] = useState<EditState>({ title: '', amount: '', date: '', category: '' })
  const [calendarOpen, setCalendarOpen] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const toggleExpand = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setEditState({
      title: expense.title,
      amount: String(expense.amount),
      date: expense.date,
      category: expense.category ? String(expense.category) : '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setCalendarOpen(false)
  }

  const saveEdit = () => {
    if (!editingId) return
    onSave(editingId, {
      title: editState.title,
      amount: parseFloat(editState.amount),
      date: editState.date,
      category: editState.category ? parseInt(editState.category) : null,
    })
    setEditingId(null)
    setCalendarOpen(false)
  }

  const hasBreakdownContent = (expense: Expense) => {
    return expense.clusters && expense.clusters.some(c => c.items && c.items.length > 0)
  }

  if (loading) {
    return <div className='py-8 text-center text-muted-foreground'>Loading expenses...</div>
  }

  if (data.length === 0) {
    return (
      <div className='py-8 text-center text-muted-foreground'>
        No expenses yet. Click "Add Expense" to get started.
      </div>
    )
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[160px]'>Date</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className='text-right'>Amount</TableHead>
            <TableHead className='text-right w-[120px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((expense) => {
            const hasClusters = hasBreakdownContent(expense)
            const isExpanded = expandedRows.has(expense.id)
            const isEditing = editingId === expense.id
            const isBreakdown = breakdownExpenseId === expense.id

            return (
              <>
                <TableRow
                  key={expense.id}
                  className={cn(
                    hasClusters && 'cursor-pointer hover:bg-muted/50',
                    isEditing && 'bg-muted/30'
                  )}
                  onClick={() => {
                    if (hasClusters && !isEditing) toggleExpand(expense.id)
                  }}
                >
                  <TableCell>
                    {isEditing ? (
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            size='sm'
                            className='w-full justify-between text-left font-normal h-8 text-sm'
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>{editState.date ? format(new Date(editState.date), 'dd MMM yyyy') : 'Pick date'}</span>
                            <CalendarIcon className='h-3.5 w-3.5 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start' onClick={(e) => e.stopPropagation()}>
                          <Calendar
                            mode='single'
                            selected={editState.date ? new Date(editState.date) : undefined}
                            onSelect={(date) => {
                              if (date) setEditState({ ...editState, date: format(date, 'yyyy-MM-dd') })
                              setCalendarOpen(false)
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span className='flex items-center gap-1'>
                        {hasClusters && (
                          <span className='inline-flex h-5 w-5 shrink-0 items-center justify-center'>
                            {isExpanded ? (
                              <ChevronDown className='h-3.5 w-3.5' />
                            ) : (
                              <ChevronRight className='h-3.5 w-3.5' />
                            )}
                          </span>
                        )}
                        {!hasClusters && <span className='inline-block w-5' />}
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editState.title}
                        onChange={(e) => setEditState({ ...editState, title: e.target.value })}
                        className='h-8 text-sm'
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <span className='font-medium'>{expense.title}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Select
                        value={editState.category}
                        onValueChange={(v) => setEditState({ ...editState, category: v })}
                      >
                        <SelectTrigger
                          className='h-8 text-sm'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectValue placeholder='Category' />
                        </SelectTrigger>
                        <SelectContent onClick={(e) => e.stopPropagation()}>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              <span className='flex items-center gap-2'>
                                <span
                                  className='inline-block h-3 w-3 shrink-0 rounded-full'
                                  style={{ backgroundColor: cat.color }}
                                />
                                {cat.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className='flex items-center gap-2'>
                        {expense.category_color && (
                          <span
                            className='inline-block h-3 w-3 shrink-0 rounded-full'
                            style={{ backgroundColor: expense.category_color }}
                          />
                        )}
                        {expense.category_name || 'Uncategorized'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    {isEditing ? (
                      <Input
                        type='number'
                        step='0.01'
                        value={editState.amount}
                        onChange={(e) => setEditState({ ...editState, amount: e.target.value })}
                        className='h-8 text-sm text-right'
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className='font-medium'>{formatCurrency(expense.amount)}</span>
                    )}
                  </TableCell>
                  <TableCell className='text-right' onClick={(e) => e.stopPropagation()}>
                    {isEditing ? (
                      <div className='flex items-center justify-end gap-1'>
                        <Button variant='ghost' size='icon' className='h-7 w-7' onClick={cancelEdit}>
                          <X className='h-3.5 w-3.5' />
                        </Button>
                        <Button variant='ghost' size='icon' className='h-7 w-7 text-primary' onClick={saveEdit}>
                          <Check className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon'>
                            <MoreHorizontal className='h-4 w-4' />
                            <span className='sr-only'>Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => startEdit(expense)}>
                            <Edit className='mr-2 h-4 w-4' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onBreakdown(expense)}>
                            <List className='mr-2 h-4 w-4' />
                            Breakdown
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant='destructive'
                            onClick={() => onDelete(expense.id)}
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>

                {/* Inline breakdown form */}
                {isBreakdown && breakdownForm && (
                  <TableRow key={`breakdown-${expense.id}`}>
                    <TableCell colSpan={5} className='p-3'>
                      {breakdownForm}
                    </TableCell>
                  </TableRow>
                )}

                {/* Expanded cluster breakdown */}
                {isExpanded && hasClusters && !isBreakdown && (
                  <TableRow key={`expanded-${expense.id}`} className='bg-muted/30'>
                    <TableCell colSpan={5} className='px-4 py-3'>
                      <div className='ml-6 space-y-4'>
                        {expense.clusters.map((cluster) => (
                          <div key={cluster.id}>
                            <div className='mb-1.5 flex items-center gap-2'>
                              <span className='text-sm font-medium'>{cluster.name}</span>
                              <span className='text-xs text-muted-foreground'>
                                {new Date(cluster.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            {cluster.items.length > 0 && (
                              <div className='space-y-0.5'>
                                <div className='grid grid-cols-[1fr_100px_100px] gap-2 text-xs font-medium text-muted-foreground'>
                                  <span>Item</span>
                                  <span className='text-right'>Amount</span>
                                  <span className='text-right'>Quantity</span>
                                </div>
                                {cluster.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className='grid grid-cols-[1fr_100px_100px] gap-2 text-sm'
                                  >
                                    <span>{item.name}</span>
                                    <span className='text-right'>{formatCurrency(item.amount)}</span>
                                    <span className='text-right text-muted-foreground'>
                                      {item.quantity || '—'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
