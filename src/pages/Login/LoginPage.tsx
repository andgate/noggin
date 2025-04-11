import { Center, Container, Paper, Title } from '@mantine/core'
import { LoginForm } from '@noggin/components/Auth/LoginForm'
import React from 'react'

export const LoginPage: React.FC = () => {
  return (
    <Center style={{ height: 'calc(100vh - var(--app-shell-header-height, 0px))' }}>
      <Container size="xs" style={{ width: '100%' }}>
        <Paper withBorder shadow="md" p={30} radius="md">
          <Title ta="center" mb="xl">
            Welcome Back!
          </Title>
          <LoginForm />
          {/* TODO: Add links for Sign Up / Forgot Password later */}
        </Paper>
      </Container>
    </Center>
  )
}

// Exporting as default for potential lazy loading later if needed
export default LoginPage
