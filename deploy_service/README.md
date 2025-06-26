# deploy_service

Listens for build requests, builds projects, and uploads the output to S3.

## Purpose

- Watches Redis `build-queue` for new build requests
- Downloads uploaded code from S3
- Installs dependencies and builds the project
- Uploads built output to S3 under `output/{id}/dist/`

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

## Flow

1. Wait for project ID in Redis build queue
2. Download project from S3
3. Build project (e.g., run `npm install` and `npm run build`)
4. Upload build output to S3

## Related Docs

- [Top-level README](../README.md)
- [Architecture](../docs/architecture.md)
