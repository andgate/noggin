import { ActionIcon, Anchor, Center, Container, Paper, Title } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import React from 'react'
import { LoginForm } from './LoginForm'

export const LoginPage: React.FC = () => {
  return (
    <Center style={{ height: '100vh' }}>
      <Container size="xs" style={{ width: '100%' }}>
        <Paper withBorder shadow="md" p={30} radius="md" style={{ position: 'relative' }}>
          <ActionIcon
            component={Link}
            to="/"
            variant="subtle"
            color="gray"
            aria-label="Close login form"
            style={{ position: 'absolute', top: 10, right: 10 }}
          >
            <IconX size={18} />
          </ActionIcon>
          <Title ta="center" mb="xl">
            Welcome Back!
          </Title>
          <LoginForm />
          <Anchor component={Link} to="/signup" size="sm" ta="center" mt="md">
            Don't have an account? Sign Up
          </Anchor>
          {/* TODO: Add link for Forgot Password later */}
        </Paper>
      </Container>
    </Center>
  )
}

export default LoginPage
