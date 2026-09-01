import { useEffect, useState } from 'react'
import { IndianRupee, TrendingDown, Landmark, Tags } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import api from '@/lib/api'
import { Overview } from './components/overview'
import { RecentExpenses } from './components/recent-expenses'

interface DashboardData {
  opening_balance: number
  closing_balance: number
  credited_this_month: number
  total_expenses: number
  category_count: number
  expenses_by_category: Array<{
    category_name: string
    total: number
    color: string
  }>
  monthly_trend: Array<{
    month: string
    total_expenses: number
    income: number
  }>
  recent_expenses: Array<{
    id: number
    title: string
    amount: number
    date: string
    category_name: string
  }>
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/summary/')
        setData(response.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <>
      <Header>
        <div className='me-auto'>
          <h1 className='text-lg font-semibold'>Dashboard</h1>
        </div>
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
        </div>

        <div className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Opening Balance
                </CardTitle>
                <Landmark className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {loading ? '...' : formatCurrency(data?.opening_balance ?? 0)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Balance carried from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Expenses
                </CardTitle>
                <TrendingDown className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {loading ? '...' : formatCurrency(data?.total_expenses ?? 0)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  This month's spending
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Closing Balance
                </CardTitle>
                <IndianRupee className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {loading ? '...' : formatCurrency(data?.closing_balance ?? 0)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  After expenses &amp; credited income
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Categories
                </CardTitle>
                <Tags className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {loading ? '...' : data?.category_count ?? 0}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Expense categories
                </p>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
            <Card className='col-span-1 lg:col-span-4'>
              <CardHeader>
                <CardTitle>Monthly Overview</CardTitle>
                <CardDescription>Expenses vs Income for the last 6 months</CardDescription>
              </CardHeader>
              <CardContent className='ps-2'>
                <Overview data={data?.monthly_trend ?? []} loading={loading} />
              </CardContent>
            </Card>
            <Card className='col-span-1 lg:col-span-3'>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>
                  Your latest transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentExpenses expenses={data?.recent_expenses ?? []} loading={loading} />
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
