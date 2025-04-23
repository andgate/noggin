import { supabase } from '@/shared/api/supabase-client'
import { Alert, Box, Button, Group, PasswordInput, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle } from '@tabler/icons-react'
import { useState } from 'react'
import { z } from 'zod'

const schema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // path of error
  })

export function SignupForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true)
    setError(null)
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        // options: { data: { invite_code: values.inviteCode } } // Add invite code later if needed
      })

      if (signUpError) {
        throw signUpError
      }

      notifications.show({
        title: 'Signup Successful',
        message: 'Please check your email to confirm your account.',
        color: 'green',
      })
      form.reset() // Reset form on success
    } catch (err: unknown) {
      // Changed from any to unknown
      let errorMessage = 'An unexpected error occurred. Please try again.'
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      }
      setError(errorMessage)
      notifications.show({
        title: 'Signup Failed',
        message: errorMessage,
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
      {error && (
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" mb="md">
          {error}
        </Alert>
      )}
      <TextInput
        required
        label="Email"
        placeholder="your@email.com"
        {...form.getInputProps('email')}
        mb="sm"
      />
      <PasswordInput
        required
        label="Password"
        placeholder="Your password"
        {...form.getInputProps('password')}
        mb="sm"
      />
      <PasswordInput
        required
        label="Confirm Password"
        placeholder="Confirm your password"
        {...form.getInputProps('confirmPassword')}
        mb="md"
      />
      <Group justify="flex-end" mt="md">
        <Button type="submit" loading={loading}>
          Sign Up
        </Button>
      </Group>
    </Box>
  )
}
