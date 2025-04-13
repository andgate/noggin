import { Button, Center, Container, Group, Image, Paper, Stack, Text, Title } from '@mantine/core'
import { Link } from '@tanstack/react-router'
import React from 'react'
import coolBrain from '../../assets/cool-brain.png'

export const SplashPage: React.FC = () => {
  return (
    <Center style={{ height: '100vh', padding: 'var(--mantine-spacing-md)' }}>
      <Container size="sm">
        {/* Add position: relative to make it the positioning context for the image */}
        <Paper withBorder shadow="md" p="xl" radius="md" style={{ position: 'relative' }}>
          <Stack align="center" gap="xl">
            <Title order={1} ta="center">
              Welcome to Noggin
            </Title>
            <Text ta="center" size="lg" c="dimmed">
              A modular, self-directed learning system designed to empower you to explore and master
              any subject through a flexible, transparent, and adaptive framework.
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
          {/* Add the image */}
          <Image
            src={coolBrain}
            alt="Cool Brain"
            style={{
              position: 'absolute',
              bottom: 'var(--mantine-spacing-md)', // Position relative to Paper padding
              right: 'var(--mantine-spacing-md)', // Position relative to Paper padding
              width: '50px', // Adjust size as needed
              height: 'auto',
            }}
          />
        </Paper>
      </Container>
    </Center>
  )
}

export default SplashPage
