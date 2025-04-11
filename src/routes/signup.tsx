import { SignupPage } from '@noggin/pages/Signup/SignupPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})
