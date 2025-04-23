import coolBrain from '@/assets/cool-brain.png'
import splashBackground from '@/assets/splash_background.jpg'
import { Button, Center, Container, Group, Image, Paper, Stack, Text, Title } from '@mantine/core'
import { Link } from '@tanstack/react-router'
import React from 'react'

export const SplashPage: React.FC = () => {
  return (
    // Wrapper div with fancy background
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: 'black', // Set background color
        backgroundImage: `url(${splashBackground})`, // Set background image
        backgroundPosition: 'center center', // Center the background image
        backgroundRepeat: 'no-repeat', // Do not repeat the background image
        // backgroundSize: 'cover', // Uncomment this if you want it to cover the whole area instead of 'contain'
      }}
    >
      {/* Cool Brain Image */}
      <Image
        src={coolBrain}
        alt="" // Decorative image
        style={{
          position: 'absolute',
          bottom: -200, // Anchor to bottom
          left: -50, // Anchor to left
          width: '600px', // Adjust size as needed
          height: 'auto', // Maintain aspect ratio
          transform: 'scaleX(-1)', // Flip horizontally
          opacity: 0.7, // Optional: Adjust opacity for subtlety
        }}
      />
      {/* Content Area (remains the same, layered above everything else) */}
      <Center
        style={{
          minHeight: '100vh',
          padding: 'var(--mantine-spacing-md)',
          position: 'relative',
          zIndex: 1, // Ensures content is above the coolBrain image
        }}
      >
        <Container size="sm">
          <Paper withBorder shadow="md" p="xl" radius="md">
            <Stack align="center" gap="xl">
              <Title order={1} ta="center">
                Welcome to Noggin
              </Title>
              <Text ta="center" size="lg" c="dimmed">
                A modular, self-directed learning system designed to empower you to explore and
                master any subject through a flexible, transparent, and adaptive framework.
              </Text>
              <Group grow style={{ width: '100%' }}>
                <Button
                  component={Link}
                  to="/login"
                  size="lg"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan' }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/signup"
                  size="lg"
                  variant="gradient"
                  gradient={{ from: 'teal', to: 'lime', deg: 105 }}
                >
                  Sign Up
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Container>
      </Center>
    </div>
  )
}

export default SplashPage
