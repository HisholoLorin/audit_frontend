import { useEffect, useState, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  SearchFilterSort,
  applySortAndFilter,
  type SortState,
} from '@/components/search-filter-sort'
import { MonthPicker } from '@/components/month-picker'
import { ExpenseInlineForm } from './components/expense-inline-form'
import { BreakdownInlineForm, type ClusterState } from './components/breakdown-inline-form'
import { ExpenseTable } from './components/expense-table'
import { type Expense, type Category } from './data/schema'

const SORT_OPTIONS = [
  { label: 'Date', value: 'date' },
  { label: 'Title', value: 'title' },
  { label: 'Amount', value: 'amount' },
  { label: 'Category', value: 'category_name' },
]

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [breakdownExpenseId, setBreakdownExpenseId] = useState<number | null>(null)

  // Search, filter, sort state
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortState>({ field: 'date', direction: 'desc' })
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  const fetchExpenses = useCallback(async () => {
    try {
      const monthStr = format(currentMonth, 'yyyy-MM')
      const response = await api.get('/expenses/', { params: { month: monthStr } })
      setExpenses(response.data.results || response.data)
    } catch (error) {
      toast.error('Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }, [currentMonth])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories/')
      setCategories(response.data.results || response.data)
    } catch (error) {
      console.error('Failed to fetch categories')
    }
  }, [])

  useEffect(() => {
    fetchExpenses()
    fetchCategories()
  }, [fetchExpenses, fetchCategories])

  // Apply search, category filter, and sort
  const filteredExpenses = useMemo(() => {
    let data = expenses

    // Category filter
    if (categoryFilter && categoryFilter !== 'all') {
      data = data.filter((e) => e.category === Number(categoryFilter))
    }

    // Search + sort
    return applySortAndFilter(data, search, ['title', 'category_name'], sort)
  }, [expenses, search, sort, categoryFilter])

  const handleCreate = async (data: Partial<Expense>) => {
    try {
      await api.post('/expenses/', data)
      toast.success('Expense added successfully')
      setShowCreateForm(false)
      fetchExpenses()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add expense')
    }
  }

  const handleSave = async (id: number, data: Partial<Expense>) => {
    try {
      await api.put(`/expenses/${id}/`, data)
      toast.success('Expense updated successfully')
      fetchExpenses()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update expense')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/expenses/${id}/`)
      toast.success('Expense deleted successfully')
      setBreakdownExpenseId(null)
      fetchExpenses()
    } catch {
      toast.error('Failed to delete expense')
    }
  }

  const handleBreakdown = (expense: Expense) => {
    setBreakdownExpenseId(expense.id)
  }

  const handleSaveBreakdown = async (expenseId: number, clusters: ClusterState[]) => {
    try {
      // Delete all existing clusters (cascade deletes items)
      const expense = expenses.find((e) => e.id === expenseId)
      if (expense) {
        for (const c of expense.clusters) {
          await api.delete(`/expenses/${expenseId}/clusters/${c.id}/`)
        }
      }
      // Create new clusters and their items
      for (const cluster of clusters) {
        if (!cluster.name.trim() && cluster.items.every(i => !i.name.trim())) continue
        const clusterRes = await api.post(`/expenses/${expenseId}/clusters/`, {
          name: cluster.name,
          date: cluster.date,
        })
        const clusterId = clusterRes.data.id
        for (const item of cluster.items) {
          if (item.name.trim() && item.amount.trim()) {
            await api.post(`/expenses/${expenseId}/clusters/${clusterId}/items/`, {
              name: item.name,
              amount: parseFloat(item.amount),
              quantity: item.quantity || '',
            })
          }
        }
      }
      toast.success('Breakdown saved successfully')
      setBreakdownExpenseId(null)
      fetchExpenses()
    } catch {
      toast.error('Failed to save breakdown')
    }
  }

  const breakdownExpense = breakdownExpenseId
    ? expenses.find((e) => e.id === breakdownExpenseId) || null
    : null

  return (
    <>
      <Header>
        <div className='me-auto'>
          <h1 className='text-lg font-semibold'>Expenses</h1>
        </div>
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>Expenses</h1>
          <Button onClick={() => setShowCreateForm(true)} disabled={showCreateForm}>
            <Plus className='mr-2 h-4 w-4' />
            Add Expense
          </Button>
        </div>

        <SearchFilterSort
          searchPlaceholder='Search expenses…'
          searchValue={search}
          onSearchChange={setSearch}
          sortOptions={SORT_OPTIONS}
          sort={sort}
          onSortChange={setSort}
          descLabel='Newest First'
          ascLabel='Oldest First'
          rightContent={<MonthPicker date={currentMonth} onChange={setCurrentMonth} />}
        >
          {/* Category filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className='w-40 h-9'>
              <SelectValue placeholder='Category' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SearchFilterSort>

        {showCreateForm && (
          <ExpenseInlineForm
            expense={null}
            categories={categories}
            onSave={handleCreate}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        <ExpenseTable
          data={filteredExpenses}
          loading={loading}
          categories={categories}
          onSave={handleSave}
          onDelete={handleDelete}
          onBreakdown={handleBreakdown}
          breakdownExpenseId={breakdownExpenseId}
          breakdownForm={
            breakdownExpense ? (
              <BreakdownInlineForm
                expense={breakdownExpense}
                onSave={handleSaveBreakdown}
                onCancel={() => setBreakdownExpenseId(null)}
              />
            ) : null
          }
        />
      </Main>
    </>
  )
}
