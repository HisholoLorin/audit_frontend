import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface OverviewProps {
  data: Array<{
    month: string
    total_expenses: number
    income: number
  }>
  loading: boolean
}

export function Overview({ data, loading }: OverviewProps) {
  if (loading) {
    return <div className='flex h-[350px] items-center justify-center text-muted-foreground'>Loading...</div>
  }

  if (data.length === 0) {
    return <div className='flex h-[350px] items-center justify-center text-muted-foreground'>No data available</div>
  }

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='month'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip
          formatter={(value: any) =>
            new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(value)
          }
        />
        <Legend />
        <Bar
          dataKey='income'
          name='Income'
          fill='hsl(var(--primary))'
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey='total_expenses'
          name='Expenses'
          fill='hsl(var(--destructive))'
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
