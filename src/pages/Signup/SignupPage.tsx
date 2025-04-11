import { Anchor, Center, Container, Paper, Title } from '@mantine/core'
import { SignupForm } from '@noggin/components/Auth/SignupForm'
import { Link } from '@tanstack/react-router'

export function SignupPage() {
  return (
    <Center style={{ height: '100vh' }}>
      <Container size={420} my={40}>
        <Title ta="center">Create Account</Title>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <SignupForm />
          <Anchor component={Link} to="/login" ta="center" mt="md">
            Already have an account? Login
          </Anchor>
        </Paper>
      </Container>
    </Center>
  )
}
