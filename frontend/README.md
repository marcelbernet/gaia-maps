# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Tailwind CSS Setup

This project uses the standalone Tailwind CSS CLI (downloaded as `./tailwindcss`).

- The main Tailwind input file is `src/tailwind.css`.
- The build script generates `src/tailwind.output.css` before the Vite build.
- To build Tailwind CSS manually, run:
  
  ```sh
  ./tailwindcss -i ./src/tailwind.css -o ./src/tailwind.output.css --minify
  ```
- The main build command is:
  
  ```sh
  npm run build
  ```
  This will run the Tailwind build and then the Vite build.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
