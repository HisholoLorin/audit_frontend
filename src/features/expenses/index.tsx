import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ExpenseDialog } from './components/expense-dialog'
import { ExpenseTable } from './components/expense-table'
import { type Expense, type Category } from './data/schema'

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await api.get('/expenses/')
      setExpenses(response.data.results || response.data)
    } catch (error) {
      toast.error('Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }, [])

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

  const handleSave = async (data: Partial<Expense>) => {
    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}/`, data)
        toast.success('Expense updated successfully')
      } else {
        await api.post('/expenses/', data)
        toast.success('Expense added successfully')
      }
      setDialogOpen(false)
      setEditingExpense(null)
      fetchExpenses()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save expense')
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/expenses/${id}/`)
      toast.success('Expense deleted successfully')
      fetchExpenses()
    } catch {
      toast.error('Failed to delete expense')
    }
  }

  const handleAddNew = () => {
    setEditingExpense(null)
    setDialogOpen(true)
  }

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
          <Button onClick={handleAddNew}>
            <Plus className='mr-2 h-4 w-4' />
            Add Expense
          </Button>
        </div>

        <ExpenseTable
          data={expenses}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <ExpenseDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) setEditingExpense(null)
          }}
          expense={editingExpense}
          categories={categories}
          onSave={handleSave}
        />
      </Main>
    </>
  )
}
