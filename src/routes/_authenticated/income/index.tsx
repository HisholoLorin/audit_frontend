import { createFileRoute } from '@tanstack/react-router'
import { IncomePage } from '@/features/income'

export const Route = createFileRoute('/_authenticated/income/')({
  component: IncomePage,
})
