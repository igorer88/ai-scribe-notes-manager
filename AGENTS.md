# AI Voice Note Manager Web App Development Plan

This document outlines the development plan for the AI Voice Note Manager Web App, which will support both written and voice notes and associate them with patients.

## Project Structure

This project follows a modular and layered architecture, primarily organized around domain-driven design principles.

* **`src/`**: Contains all source code for the NestJS backend application.
  * **`src/config/`**: Configuration files for the application, database, and other services.
  * **`src/database/`**: Database-related configurations, TypeORM setup, and migrations.
  * **`src/domain/`**: Core business logic, entities, services, and controllers, grouped by domain (e.g., `user`, `patient`, `note`). This is further consolidated by `domain.module.ts`.
  * **`src/shared/`**: Shared modules, utilities, interfaces, interceptors, and custom validators used across different domains.
  * **`src/main.ts`**: Application entry point.
  * **`src/app.module.ts`**: Root module of the application.
* **`web/`**: (Frontend) This directory is reserved for the React frontend application.
* **`config/`**: Configuration files for tools like linters.
* **`__test__/`**: Contains unit and E2E tests.

## I. Backend (NestJS - `src/`)

### 1. Database Schema Design

* **User Entity:** Basic user information.
* **Patient Entity:** Stores patient demographic information (`id`, `name`, `dateOfBirth`, etc.).
* **Note Entity:** Stores core note content.
  * `content`: String for written notes.
  * `audioFilePath`: String, nullable, for the path to the audio file if it's a voice note.
  * `isVoiceNote`: Boolean to distinguish between written and voice notes.
    *`createdAt`: Date, automatically managed.
  * `updatedAt`: Date, automatically managed.
  * `deletedAt`: Date, nullable, for soft-deletes.
  * `userId`: Link to the User who created the note.
  * `patientId`: Link to the Patient this note is associated with.
* **Transcription Entity:** Stores the full text transcription of a voice note, linked to `Note` (only for voice notes).

### 2. Database Seeding

* Implement a seeder for the `Patient` entity to create mock patient data on application startup.

### 3. API Endpoints

* **Authentication:** Implement user registration and login.
* **Patient Management:**
  * `POST /patients`: Create a new patient.
  * `GET /patients`: Retrieve all patients.
  * `GET /patients/:id`: Retrieve a specific patient.
* **Note Management:**
  * `POST /patients/:patientId/notes`: Create a new note associated with a specific patient (either written text or upload an audio file).
  * `GET /patients/:patientId/notes`: Retrieve all notes for a specific patient.
  * `GET /notes/:id`: Retrieve a specific note (including its transcription and associated patient metadata).
  * `DELETE /notes/:id`: Delete a note.
* **Search & Filter:**
  * `GET /notes/search?query=...`: Search notes by content or transcription, potentially filtered by `patientId`.

### 4. AI Integration Services

* Create a dedicated NestJS module (`AiProcessingModule`).
* **Transcription Service:**
  * Process audio files for voice notes using Whisper (local or API).
  * Store the transcription in the `Transcription` entity.

### 5. File Storage

* Implement a mechanism to store uploaded audio files (e.g., local filesystem).

## II. Frontend (`./web` folder - React)

### 1. Project Setup

* Create a new React project inside a `./web` folder within the `ai-scribe-notes-manager` directory.

### 2. User Interface

* Login/Registration pages.
* **Patient List/Dashboard:** Display a list of patients.
* **Patient Detail View:** When a patient is selected, display their associated notes.
* Component for creating new notes:
  * Text area for written notes.
  * Audio recording/upload functionality for voice notes.
  * **Patient selection/association for new notes.**
* Display component for notes, showing content, audio player (if voice note), and transcription (if voice note).
* Search bar and filter options (including by patient).

## III. Development Environment & Tools

* **Docker/Docker Compose:** Utilize existing `Dockerfile` and `docker-compose.yml`.
* **Testing:** Write unit and E2E tests for backend services and APIs using Jest.
* **Linting/Formatting:** Adhere to existing ESLint and Prettier configurations.

## Agent Instructions

* **Read File Before Change:** Before making any changes to a file, I must read its content to ensure I have the latest version and understand its context.
* **Post-Change Commands:** After making file changes, I must run `pnpm lint && pnpm format && pnpm build`.
* **Commit Execution:** I will only make a commit when you explicitly tell me to.
* **Staging Analysis:** If files are not staged, I will analyze them and ask if you want to split them into multiple commits if I consider it better.
* **Commit Message Format:** Commits must follow the existing format. I will analyze previous commits (`git log -n 3`) to determine the style (verbosity, formatting, signature line, etc.) and generate a message accordingly.
* **Commit Message Confirmation:** I will show the commit message in English for your confirmation before executing the commit.
* **NestJS Documentation:** For NestJS-related queries, refer to: [https://docs.nestjs.com/](https://docs.nestjs.com/)

## Next Steps

Please refer to the `Roadmap` section in `README.md` for the project plan and next steps.
