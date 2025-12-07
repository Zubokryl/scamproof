# Build/Lint/Test Commands
- **Backend (Laravel)**:
  - Test: `cd backend && php artisan test` (run all)
  - Single Test: `cd backend && php artisan test --filter TestName`
  - Lint/Fix: `cd backend && vendor/bin/pint`
  - Dev: `cd backend && php artisan serve`
- **Frontend (Next.js)**:
  - Dev: `cd frontend && npm run dev`
  - Build: `cd frontend && npm run build`
  - Lint: `cd frontend && npm run lint`

# Architecture & Structure
- **Monorepo-style**:
  - `/backend`: Laravel 12 API. Uses Sanctum for auth, SQLite database.
  - `/frontend`: Next.js 16 application (App Router).
- **Key Tech**:
  - Frontend: React 19, TailwindCSS, Radix UI, Framer Motion, Lucide Icons.
  - Backend: PHP 8.2+, Laravel Framework 12.x.

# Code Style & Conventions
- **Frontend**:
  - Use TypeScript for all new files (`.ts`, `.tsx`).
  - Styles: TailwindCSS with `clsx` and `tailwind-merge` (utils in `src/lib/utils.ts`).
  - Components: Functional components, prefer "server components" where possible in Next.js App Router.
  - API: defined in `src/api/`, ensure types matches backend responses.
- **Backend**:
  - Follow PSR-12 / Laravel coding standards (enforced by Pint).
  - Use `Feature` tests for API endpoints and `Unit` tests for logic.
