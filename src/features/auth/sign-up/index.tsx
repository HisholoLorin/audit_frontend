import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { AuthLayout } from '../auth-layout'

const formSchema = z
  .object({
    full_name: z.string().min(1, 'Please enter your full name.'),
    username: z.string().min(3, 'Username must be at least 3 characters.'),
    email: z.email({ error: () => 'Please enter a valid email.' }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.'),
    password2: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.password2, {
    message: 'Passwords do not match.',
    path: ['password2'],
  })

export function SignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      username: '',
      email: '',
      password: '',
      password2: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/register/', data)
      const { access, refresh, user } = response.data

      auth.setAccessToken(access)
      auth.setRefreshToken(refresh)
      auth.setUser(user)

      toast.success('Account created successfully!')
      navigate({ to: '/', replace: true })
    } catch (error: any) {
      const errors = error.response?.data
      if (errors && typeof errors === 'object') {
        Object.entries(errors).forEach(([key, value]) => {
          const message = Array.isArray(value) ? value[0] : String(value)
          if (key in form.getValues()) {
            form.setError(key as any, { message })
          } else {
            toast.error(message)
          }
        })
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card className='w-full sm:w-[400px] gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account.{' '}
            Already have an account?{' '}
            <Link
              to='/sign-in'
              className='text-nowrap underline underline-offset-4 hover:text-primary'
            >
              Sign In
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className={cn('grid gap-3')}
            >
              <FormField
                control={form.control}
                name='full_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder='John Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder='johndoe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='name@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='********' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password2'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='********' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className='mt-2' disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  <UserPlus />
                )}
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
