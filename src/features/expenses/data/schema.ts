export interface Category {
  id: number
  name: string
  icon: string
  color: string
}

export interface Expense {
  id: number
  title: string
  amount: number
  date: string
  description: string
  category: number | null
  category_name: string
  created_at: string
}
