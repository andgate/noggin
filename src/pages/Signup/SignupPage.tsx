import { ActionIcon, Anchor, Center, Container, Paper, Title } from '@mantine/core'
import { SignupForm } from '@noggin/components/Auth/SignupForm'
import { IconX } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

export function SignupPage() {
  return (
    <Center style={{ height: '100vh' }}>
      <Container size="xs" style={{ width: '100%' }}>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md" style={{ position: 'relative' }}>
          <ActionIcon
            component={Link}
            to="/"
            variant="subtle"
            color="gray"
            aria-label="Close signup form"
            style={{ position: 'absolute', top: 10, right: 10 }}
          >
            <IconX size={18} />
          </ActionIcon>
          <Title ta="center" mb="xl">
            Create Account
          </Title>
          <SignupForm />
          <Anchor component={Link} to="/login" size="sm" ta="center" mt="md">
            Already have an account? Login
          </Anchor>
        </Paper>
      </Container>
    </Center>
  )
}
