# Technosmart Neo Vision Boilerplate

Welcome to **Neo Vision**, a high-performance, type-safe, and modular Next.js boilerplate designed for modern scale. This project is built to handle complex requirements while maintaining a premium developer experience.

## 🚀 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (Turbopack, App Router)
- **API**: [oRPC v1.x](https://orpc.dev/) (Contract-first, type-safe RPC)
- **Database**: [Drizzle ORM](https://orm.drizzle.team/) with MySQL
- **Auth**: [Better Auth](https://www.better-auth.com/) (Production-ready authentication)
- **UI**: [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS 4
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Form Handling**: `react-hook-form` + `zod`

## 🛠️ Getting Started

### 1. Setup Environment
Copy the example environment file and fill in your credentials:
```bash
cp .env.local.example .env.local
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Management
Neo Vision uses Drizzle Kit for seamless schema management.
- **Push Schema** (Development): `npm run db:push`
- **Generate Migrations**: `npm run db:generate`
- **Apply Migrations**: `npm run db:migrate`
- **Browse Data**: `npm run db:studio`

### 4. Run Development Server
```bash
npm run dev
```

## 📖 Essential Documentation

### 🔒 Better Auth
Better Auth provides a robust authentication layer. To customize providers, session behavior, or middleware:
- **Official Docs**: [https://www.better-auth.com/docs](https://www.better-auth.com/docs)
- **Local Implementation**: See `lib/auth/index.ts` (server) and `lib/auth/client.ts` (client).

### 📡 oRPC & OpenAPI
All backend logic is served through oRPC, ensuring full type safety between the server and the frontend.
- **oRPC Docs**: [https://orpc.dev/](https://orpc.dev/)
- **OpenAPI Specification**: You can access the auto-generated OpenAPI JSON at:
  > `GET /api/rpc/openapi`
- **Contract Definition**: Check `lib/orpc/server.ts` to see how procedures are defined.

## ✨ Features Included

- **Advanced Books CRUD**: A professional example of server-side searching, sorting, pagination, and multi-step forms.
- **Theme Management**: Support for Light, Dark, and System modes with a dedicated toggle in the User Menu.
- **Responsive Sidebar**: Collapsible navigation with nested items and team switching.
- **Type-Safe Routing**: Full integration between oRPC and TanStack Query.

## 📁 Project Structure

- `app/`: Next.js App Router and API routes.
- `lib/`: Core logic (auth, db, orpc).
- `components/`: UI components (ui/, layouts/, books/).
- `hooks/`: Custom React hooks.

---
Built with ⚡ by the Antigravity Team.
