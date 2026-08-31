import { createFileRoute } from '@tanstack/react-router'
import { SalaryPage } from '@/features/salary'

export const Route = createFileRoute('/_authenticated/salary/')({ 
  component: SalaryPage,
})
