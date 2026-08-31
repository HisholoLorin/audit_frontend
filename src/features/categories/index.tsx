import { useEffect, useState, useCallback } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit, Trash2 } from 'lucide-react'
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

interface Category {
  id: number
  name: string
  icon: string
  color: string
}

const formSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  color: z.string().optional(),
})

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', color: '#6366f1' },
  })

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories/')
      setCategories(response.data.results || response.data)
    } catch {
      toast.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleAddNew = () => {
    setEditingCategory(null)
    form.reset({ name: '', color: '#6366f1' })
    setDialogOpen(true)
  }

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat)
    form.reset({ name: cat.name, color: cat.color })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/categories/${id}/`)
      toast.success('Category deleted')
      fetchCategories()
    } catch {
      toast.error('Failed to delete category')
    }
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}/`, data)
        toast.success('Category updated')
      } else {
        await api.post('/categories/', data)
        toast.success('Category created')
      }
      setDialogOpen(false)
      fetchCategories()
    } catch (error: any) {
      toast.error(error.response?.data?.name?.[0] || 'Failed to save category')
    }
  }

  return (
    <>
      <Header>
        <div className='me-auto'>
          <h1 className='text-lg font-semibold'>Categories</h1>
        </div>
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>Categories</h1>
          <Button onClick={handleAddNew}>
            <Plus className='mr-2 h-4 w-4' />
            Add Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Organize your expenses into categories</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='text-center py-8 text-muted-foreground'>Loading...</div>
            ) : categories.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                No categories yet. Click "Add Category" to create one.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Color</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>
                        <div
                          className='h-4 w-4 rounded-full'
                          style={{ backgroundColor: cat.color }}
                        />
                      </TableCell>
                      <TableCell className='font-medium'>{cat.name}</TableCell>
                      <TableCell className='text-right'>
                        <Button variant='ghost' size='icon' onClick={() => handleEdit(cat)}>
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='icon' onClick={() => handleDelete(cat.id)}>
                          <Trash2 className='h-4 w-4 text-destructive' />
                        </Button>
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
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update category details.' : 'Create a new expense category.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., Food' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='color'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <div className='flex items-center gap-2'>
                          <Input type='color' className='h-10 w-14 p-1' {...field} />
                          <Input placeholder='#6366f1' value={field.value} onChange={field.onChange} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type='submit'>{editingCategory ? 'Update' : 'Create'} Category</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
