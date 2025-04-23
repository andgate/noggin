import { Route as LoginRoute } from '@/routes/login'
import { supabase } from '@/shared/api/supabase-client'
import {
  Alert,
  Button,
  Group,
  LoadingOverlay,
  PasswordInput,
  Stack,
  TextInput,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { IconAlertCircle } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import React, { useState } from 'react'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password cannot be empty' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const search = LoginRoute.useSearch()
  const redirect = search.redirect

  const form = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: zodResolver(loginSchema),
  })

  const handleSubmit = async (values: LoginFormValues) => {
    setError(null)
    setIsLoading(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }
      // On success, the onAuthStateChange listener in AuthProvider
      // will handle the session update. We just need to navigate.
      // If a redirect param exists (only possible on /login route), use it.
      // Otherwise, navigate to the dashboard root '/'.
      const targetPath = redirect || '/'
      console.log(`Login successful, navigating to: ${targetPath}`)
      // Use navigate for SPA navigation
      navigate({ to: targetPath, replace: true }) // Replace history entry
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An unexpected error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <LoadingOverlay visible={isLoading} overlayProps={{ radius: 'sm', blur: 2 }} />
      <Stack gap="md">
        {error && (
          <Alert
            title="Login Failed"
            color="red"
            icon={<IconAlertCircle size={16} />}
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        <TextInput
          required
          label="Email"
          placeholder="your@email.com"
          {...form.getInputProps('email')}
        />
        <PasswordInput
          required
          label="Password"
          placeholder="Your password"
          {...form.getInputProps('password')}
        />
        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={isLoading}>
            Login
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
