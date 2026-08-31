import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const profileFormSchema = z.object({
  full_name: z.string().min(1, 'Please enter your full name.'),
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters.')
    .max(30, 'Username must not be longer than 30 characters.'),
  email: z.email('Please enter a valid email.'),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { auth } = useAuthStore()
  const user = auth.user
  const [isUpdating, setIsUpdating] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      username: user?.username || '',
      email: user?.email || '',
    },
    mode: 'onChange',
  })

  // Update form if user state changes
  useEffect(() => {
    if (user) {
      form.reset({
        full_name: user.full_name || '',
        username: user.username || '',
        email: user.email || '',
      })
    }
  }, [user, form])

  async function onSubmit(data: ProfileFormValues) {
    setIsUpdating(true)
    try {
      const response = await api.put('/auth/me/', data)
      // Update the user in our global store with the new data
      auth.setUser(response.data)
      toast.success('Profile updated successfully!')
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
        toast.error('Failed to update profile.')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 max-w-xl'>
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
              <FormDescription>
                This is your public display name.
              </FormDescription>
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
                <Input placeholder='name@example.com' type='email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isUpdating}>
          {isUpdating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Update profile
        </Button>
      </form>
    </Form>
  )
}
