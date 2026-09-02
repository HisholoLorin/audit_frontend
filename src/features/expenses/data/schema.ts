export interface Category {
  id: number
  name: string
  icon: string
  color: string
}

export interface ExpenseBreakdown {
  id: number
  cluster: number
  name: string
  amount: number
  quantity: string
}

export interface BreakdownCluster {
  id: number
  expense: number
  name: string
  date: string
  items: ExpenseBreakdown[]
}

export interface Expense {
  id: number
  title: string
  amount: number
  date: string
  category: number | null
  category_name: string
  category_color: string | null
  created_at: string
  clusters: BreakdownCluster[]
}
