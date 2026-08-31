import { Receipt } from 'lucide-react'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='min-h-svh flex items-center justify-center p-4 sm:p-8 bg-muted/20'>
      <div className='w-full max-w-md space-y-4'>
        <div className='mb-4 flex items-center justify-center'>
          <Receipt className='me-2 h-6 w-6' />
          <h1 className='text-xl font-medium'>Audit System</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
