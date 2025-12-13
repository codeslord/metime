# GEMINI.md

## Project Overview
**Crafternia** is an AI-powered "Infinite Craft Workbench" designed to transform craft ideas into visual, step-by-step instruction sequences. It resurrects the aesthetic and utility of traditional paper craft manuals using generative AI.

The core value proposition is to "dissect imagination" into reality by generating:
1.  **Master Reference Images**: Studio-quality photos of the finished craft.
2.  **Intelligent Dissection**: Breaking down the craft into materials and steps.
3.  **Isolated Step Visualizations**: "Knolling" style images for each step, showing only necessary components.
4.  **Infinite Canvas**: A spatial UI for organizing instructions.

## Tech Stack
*   **Framework**: React 19
*   **Build Tool**: Vite
*   **Language**: TypeScript
*   **Styling**: TailwindCSS
*   **UI Library**: React Flow (@xyflow/react) for the infinite canvas
*   **AI SDK**: Google GenAI SDK (@google/genai)
*   **Icons**: Lucide React
*   **Package Manager**: npm

## Architecture & File Structure
```
Crafternia/
├── components/          # React components (UI, specific features)
├── services/            # API services (e.g., geminiService.ts)
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks (if applicable)
├── utils/               # Helper functions and utilities
├── types.ts             # TypeScript type definitions
├── constants.ts         # Global constants (if applicable)
├── App.tsx              # Main application component
├── index.tsx            # Entry point
└── public/              # Static assets
```

## Key Features & AI Integration
*   **Master Image Generation**: Uses `gemini-3-pro-image-preview`.
    *   *Prompt Strategy*: Photorealistic studio photography, neutral background, handmade textures.
*   **Dissection (Text Reasoning)**: Uses `gemini-2.5-flash`.
    *   *Prompt Strategy*: Expert maker persona, returns strict JSON for complexity, materials, and steps.
*   **Step Image Generation**: Uses `gemini-3-pro-image-preview`.
    *   *Prompt Strategy*: Extreme isolation, knolling/macro views, consistency with master image, white background.

## Development Workflow
*   **Start Dev Server**: `npm run dev` (Runs on http://localhost:5173 by default, or 3000)
*   **Build for Production**: `npm run build`
*   **Preview Production Build**: `npm run preview`

## Coding Conventions
*   **Functional Components**: Use React functional components with Hooks.
*   **TypeScript**: Use interfaces/types for props and state. Avoid `any`.
*   **Styling**: Use utility-first Tailwind classes.
*   **State Management**: Use React Context for global state (e.g., for managing the craft project data).
*   **AI Services**: Encapsulate API calls in `services/`. Handle errors and rate limits gracefully (exponential backoff).

## Important Files
*   `prd.md`: Comprehensive Product Requirement Document. Source of truth for features and prompts.
*   `README.md`: General project information and setup guide.
*   `services/geminiService.ts`: Core logic for interacting with Gemini API.

## Notes for Agents
*   When modifying prompts, strictly adhere to the prompt engineering strategy defined in `prd.md`.
*   Ensure the infinite canvas interactions remain smooth; avoid heavy computations in the render loop.
*   The project uses `module` type in `package.json`, so use ESM syntax.
