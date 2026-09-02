import { useState } from 'react'
import { Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { type Expense } from '../data/schema'

interface ClusterItem {
  id?: number
  name: string
  amount: string
  quantity: string
}

interface ClusterState {
  id?: number
  name: string
  date: string
  items: ClusterItem[]
}

interface BreakdownInlineFormProps {
  expense: Expense
  onSave: (expenseId: number, clusters: ClusterState[]) => void
  onCancel: () => void
}

export function BreakdownInlineForm({
  expense,
  onSave,
  onCancel,
}: BreakdownInlineFormProps) {
  const [clusters, setClusters] = useState<ClusterState[]>(() => {
    if (expense.clusters && expense.clusters.length > 0) {
      return expense.clusters.map((c) => ({
        id: c.id,
        name: c.name,
        date: c.date,
        items: c.items.map((item) => ({
          id: item.id,
          name: item.name,
          amount: String(item.amount),
          quantity: item.quantity || '',
        })),
      }))
    }
    return [{
      name: '',
      date: new Date().toISOString().split('T')[0],
      items: [{ name: '', amount: '', quantity: '' }],
    }]
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const addCluster = () => {
    setClusters([
      ...clusters,
      {
        name: '',
        date: new Date().toISOString().split('T')[0],
        items: [{ name: '', amount: '', quantity: '' }],
      },
    ])
  }

  const removeCluster = (ci: number) => {
    setClusters(clusters.filter((_, i) => i !== ci))
  }

  const updateCluster = (ci: number, field: 'name' | 'date', value: string) => {
    setClusters(clusters.map((c, i) => (i === ci ? { ...c, [field]: value } : c)))
  }

  const addItem = (ci: number) => {
    setClusters(
      clusters.map((c, i) =>
        i === ci ? { ...c, items: [...c.items, { name: '', amount: '', quantity: '' }] } : c
      )
    )
  }

  const removeItem = (ci: number, ii: number) => {
    setClusters(
      clusters.map((c, i) =>
        i === ci ? { ...c, items: c.items.filter((_, j) => j !== ii) } : c
      )
    )
  }

  const updateItem = (ci: number, ii: number, field: keyof ClusterItem, value: string) => {
    setClusters(
      clusters.map((c, i) =>
        i === ci
          ? {
              ...c,
              items: c.items.map((item, j) =>
                j === ii ? { ...item, [field]: value } : item
              ),
            }
          : c
      )
    )
  }

  const handleSave = () => {
    onSave(expense.id, clusters)
  }

  const totalBreakdown = clusters.reduce((sum, c) => {
    return sum + c.items.reduce((s, item) => {
      const amt = parseFloat(item.amount)
      return s + (isNaN(amt) ? 0 : amt)
    }, 0)
  }, 0)

  return (
    <div className='rounded-md border border-dashed bg-muted/30 p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <h4 className='text-sm font-medium'>
            Breakdown for "{expense.title}"
          </h4>
          <p className='text-xs text-muted-foreground'>
            Total: {formatCurrency(expense.amount)} · Itemized: {formatCurrency(totalBreakdown)}
            {totalBreakdown > 0 && totalBreakdown !== expense.amount && (
              <span className='ml-1 text-yellow-600'>
                (Difference: {formatCurrency(Math.abs(expense.amount - totalBreakdown))})
              </span>
            )}
          </p>
        </div>
        <Button type='button' variant='outline' size='sm' onClick={addCluster}>
          <Plus className='mr-1 h-3.5 w-3.5' />
          Add Cluster
        </Button>
      </div>

      <div className='space-y-4'>
        {clusters.map((cluster, ci) => (
          <div key={ci} className='rounded-md border bg-background p-3'>
            {/* Cluster header */}
            <div className='mb-3 flex items-center gap-2'>
              <Input
                placeholder='Title'
                value={cluster.name}
                onChange={(e) => updateCluster(ci, 'name', e.target.value)}
                className='h-8 flex-1 text-sm'
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline' size='sm' className='h-8 gap-1.5 text-sm shrink-0'>
                    <CalendarIcon className='h-3.5 w-3.5' />
                    {cluster.date
                      ? format(new Date(cluster.date), 'dd MMM yyyy')
                      : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='end'>
                  <Calendar
                    mode='single'
                    selected={cluster.date ? new Date(cluster.date) : undefined}
                    onSelect={(date) => {
                      if (date) updateCluster(ci, 'date', format(date, 'yyyy-MM-dd'))
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {clusters.length > 1 && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 shrink-0'
                  onClick={() => removeCluster(ci)}
                >
                  <Trash2 className='h-3.5 w-3.5 text-destructive' />
                </Button>
              )}
            </div>

            {/* Items */}
            <div className='space-y-1.5'>
              <div className='grid grid-cols-[1fr_120px_120px_40px] gap-2 text-xs font-medium text-muted-foreground'>
                <span>Item Name</span>
                <span>Amount (₹)</span>
                <span>Quantity</span>
                <span />
              </div>
              {cluster.items.map((item, ii) => (
                <div key={ii} className='grid grid-cols-[1fr_120px_120px_40px] gap-2'>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(ci, ii, 'name', e.target.value)}
                    className='h-8 text-sm'
                  />
                  <Input
                    type='number'
                    step='0.01'
                    value={item.amount}
                    onChange={(e) => updateItem(ci, ii, 'amount', e.target.value)}
                    className='h-8 text-sm'
                  />
                  <Input
                    value={item.quantity}
                    onChange={(e) => updateItem(ci, ii, 'quantity', e.target.value)}
                    className='h-8 text-sm'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => removeItem(ci, ii)}
                    disabled={cluster.items.length === 1}
                  >
                    <Trash2 className='h-3.5 w-3.5 text-destructive' />
                  </Button>
                </div>
              ))}
              <Button type='button' variant='ghost' size='sm' className='h-7 text-xs' onClick={() => addItem(ci)}>
                <Plus className='mr-1 h-3 w-3' />
                Add Item
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-3 flex justify-end gap-2'>
        <Button type='button' variant='outline' size='sm' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='button' size='sm' onClick={handleSave}>
          Save Breakdown
        </Button>
      </div>
    </div>
  )
}

export type { ClusterState }
