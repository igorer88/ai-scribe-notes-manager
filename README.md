<p align="center">AI Voice Note Manager Web App</p>
<p align="center">A web application for managing written and voice notes, associating them with patients, and leveraging AI for transcription, summarization, and tagging.</p>

<p align="center">
<a href="https://nodejs.org" target="_blank"><img src="https://img.shields.io/badge/node-%3E%3D22.0.0-green.svg" alt="Node.js version" /></a>
<a href="https://pnpm.io" target="_blank"><img src="https://img.shields.io/badge/pnpm-%3E%3D10.0.0-cc00ff.svg" alt="pnpm version" /></a>
</p>

## Description

This project is the backend for the AI Voice Note Manager Web App, built with NestJS. It provides APIs for managing patients, notes (both written and voice), and integrates with AI services for transcription, summarization, and keyword extraction. The database used is PostgreSQL.

## Technologies

- **Backend:** NestJS (TypeScript)
- **Database:** PostgreSQL
- **Package Manager:** pnpm
- **Compiler:** SWC
- **Frontend:** React (to be developed in `./web` folder)

## Project setup

```bash
pnpm install
```

### Environment Variables

1. Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

2. Fill in the required values in `.env`:
   - **Required for all environments:** `BUILD_STAGE`, `API_SECRET_KEY`, database variables (`DB_*`)
   - **Optional:** `NODE_ENV` (defined automatically by Docker stage), logging and console settings, file storage configuration (`FILE_STORAGE_*`), AI transcription settings
   - The example file contains working defaults for development

### AI Configuration

The application supports AI-powered transcription for voice notes. Configure the following environment variables:

#### Transcription Provider Settings

- `AI_TRANSCRIPTION_PROVIDER=whisperApi` (default: `whisperApi`)
  - Currently only supports `whisperApi` (local Whisper service)
- `AI_TRANSCRIPTION_WHISPER_API_URL=http://localhost:9000` (default: `http://localhost:9000`)
  - URL of the local Whisper API service

#### Docker Compose Whisper Settings

- `WHISPER_MODEL=base` (default: `base`)
  - Options: `tiny`, `base`, `small`, `medium`, `large` (larger models are more accurate but slower)
- `WHISPER_ENGINE=openai_whisper` (default: `openai_whisper`)


## Compile and run the project

### Local Development

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev
```

### Production (Local with Docker)

For production-like environment with Docker:

1. **Configure environment for production:**
   ```bash
   cp .env.example .env
   # Edit .env and set BUILD_STAGE=prod
   ```

2. **Run with Docker Compose (includes database setup):**

The database setup is handled automatically when you start the containers. The first time you run the application, it will:
   ```bash
   # Start the entire application (database + API)
   docker-compose up -d

   # Or start only the webapp (assuming database is already running)
   docker-compose up -d webapp
   ```
   This will create:

- Database tables and schema
- 1 demo user (username: "demo", password: "demo")
- 4 sample patients with realistic data

   This will automatically:
   - Wait for PostgreSQL to be ready
   - Run database migrations (first run only)
   - Seed the database with initial data (first run only)
   - Start the application on port 3000

**Note:** If you need to re-run seeders manually, you can use:
```bash
pnpm seed
```

3. **Check logs:**
   ```bash
   docker-compose logs -f webapp
   ```

### Manual Production Mode

If you prefer to run without Docker:

```bash
# production mode (requires manual database setup)
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Roadmap

This section outlines the planned development steps for the AI Voice Note Manager Web App.

### I. Backend Development

**Core Entities & CRUD:**

- ✅ Implement basic CRUD operations for User, Patient, and Note entities.
- ✅ Generate migrations for basic entities
- [ ] Add in-app voice recording for notes

**File Storage:** Implement a mechanism to store uploaded audio files.

- ✅ Local storage
- ✅ Configure MinIO to store file as AWS S3 compatible storage
- ✅ Adapt file storage module to use AWS S3 compatible service
- [ ] Use Minio S3 provider in File Storage service

**AI Processing Services:** Develop and integrate services for:

- ✅ Transcription (Generate service and entities).
- ✅ AIProcessing (Generate shared module using Whisper API or LLM API).
- [ ] Summarization (using LLM API).

### II. Frontend Development

- ✅ **Project Setup:** Create and configure the React project.
- [ ] **User Interface:**
  - ✅ Patient List/Dashboard.
  - ✅ Patient Detail View (displaying statistics, and associated notes).
  - ✅ Component for creating new notes (text area, audio recording/upload, patient association).
  - ✅ Display component for notes (content, audio player, transcription).
  - [ ] Login/Registration pages.
  - [ ] Search bar and filter options.

## License

This project is [MIT licensed](./LICENSE).
