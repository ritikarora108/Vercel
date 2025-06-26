# upload_service

Handles user uploads, stores codebases in S3, and queues build requests for deployment.

## Purpose

- Accepts user project uploads (e.g., zipped codebases)
- Stores uploads in S3 under `uploads/{id}/`
- Pushes build requests to Redis queue (`build-queue`)
- Sets status in Redis (`status` hash)

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Configure environment variables in `.env`:
   - AWS/S3 credentials
   - Redis connection info
3. Start the service:
   ```sh
   npm run dev
   ```

## API

- `POST /deploy` — Upload a project and queue a build

## Flow

1. User uploads a project via `/deploy`
2. Service stores files in S3
3. Service pushes project ID to Redis build queue
4. Service sets status in Redis

## Related Docs

- [Top-level README](../README.md)
- [Architecture](../docs/architecture.md)
