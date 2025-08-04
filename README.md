# FlashLearn · powered by [sv](https://github.com/sveltejs/cli)

Welcome to **FlashLearn** — a smart flashcard and spaced repetition learning app built with the [sv](https://github.com/sveltejs/cli) SvelteKit starter.

---

## 🚀 Getting Started

### 1. Create a Project

```bash  
# create a new project in the current directory  
npx sv create

# or in a specific directory  
npx sv create flashlearn  
cd flashlearn
```
### 2. Install Dependencies

```bash  
npm install  
# or  
pnpm install  
# or  
yarn install
```
### 3. Start the Development Server

```bash  
npm run dev

# Optional: open in browser automatically  
npm run dev -- --open
```
---

## 🔨 Building for Production

Create an optimized production build:

```bash  
npm run build
```
Then preview it locally:

```bash  
npm run preview
```
> 💡 To deploy, install the appropriate [SvelteKit adapter](https://kit.svelte.dev/docs/adapters) for your target (e.g., Vercel, Netlify, Node, Static, etc.).

---

## 🧠 About FlashLearn

FlashLearn is built with:

- [SvelteKit](https://kit.svelte.dev/)
- [sv](https://github.com/sveltejs/cli) for bootstrapping
- [flowbite-svelte](https://flowbite-svelte.com/) for UI components
- Local/session storage-based authentication
- SPA navigation using `goto` from `$app/navigation`

---

## ✨ Features

- 🔒 Auth-aware navigation header (login, logout, user greeting)
- 🧠 Personalized dashboards for logged-in users
- 📊 Progress tracking and spaced repetition
- 📚 Custom flashcard deck creation
- ⚡ Clean and responsive UI

## 🧪 Tech Stack

- SvelteKit + TypeScript
- Tailwind CSS
- Flowbite-Svelte
- Local/session storage for auth
- Minimal, composable UI

---

## 🤝 Contributing

Feel free to fork or clone and extend the app. FlashLearn is an educational tool, but also a clean SvelteKit boilerplate with smart defaults.
