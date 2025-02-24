import Docker from 'dockerode'
import path from 'path'
import { fileURLToPath } from 'url'

const docker = new Docker()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

console.log('Project root:', projectRoot)

async function runE2ETests() {
    try {
        // Build the image with debug logging
        console.log('Building E2E test image...')
        const buildStream = await docker.buildImage(
            {
                context: projectRoot,
                src: ['Dockerfile.e2e', 'package.json', 'pnpm-lock.yaml', '.'],
            },
            {
                t: 'playwright-e2e-tests',
            }
        )

        // Wait for build to complete with detailed logging
        await new Promise((resolve, reject) => {
            docker.modem.followProgress(
                buildStream,
                (err, res) => {
                    if (err) {
                        console.error('Build failed:', err)
                        reject(err)
                    } else {
                        console.log('Build completed:', res)
                        resolve(res)
                    }
                },
                (event) => {
                    // Log build progress
                    if (event.stream) {
                        process.stdout.write(event.stream)
                    }
                }
            )
        })

        // Run the container
        console.log('Running E2E tests...')
        const container = await docker.createContainer({
            Image: 'playwright-e2e-tests',
            HostConfig: {
                AutoRemove: true,
                Binds: [`${projectRoot}/e2e-reports:/app/e2e-reports`],
                IpcMode: 'host',
            },
        })

        await container.start()

        // Stream the output
        const logStream = await container.logs({
            follow: true,
            stdout: true,
            stderr: true,
        })

        // Handle the log stream properly
        await new Promise((resolve, reject) => {
            container.modem.demuxStream(logStream, process.stdout, process.stderr)
            logStream.on('end', resolve)
            logStream.on('error', reject)
        })

        // Wait for container to finish
        const [result] = await container.wait()

        if (result.StatusCode !== 0) {
            throw new Error(`Tests failed with status code ${result.StatusCode}`)
        }

        console.log('E2E tests completed successfully!')
    } catch (error) {
        console.error('Error running E2E tests:', error)
        process.exit(1)
    }
}

runE2ETests()
