# GEMINI.md

## Project Overview
**Me Time** is an AI-powered mindful creative app designed to help users slow down and reconnect through simple, calming creative activities. It uses generative AI to provide step-by-step guidance for various art forms including drawing, painting, coloring, and more.

The core value proposition is to provide "mindful doing" by:
1.  **Master Reference Images**: Beautiful reference art for each activity.
2.  **Intelligent Dissection**: Breaking down the creation process into manageable steps.
3.  **Progressive Step Visualizations**: Using BRIA FIBO's refinement to progressively build images.
4.  **Infinite Canvas**: A spatial UI for organizing and connecting creative elements.

## Tech Stack
*   **Framework**: React 19
*   **Build Tool**: Vite
*   **Language**: TypeScript
*   **Styling**: TailwindCSS
*   **UI Library**: React Flow (@xyflow/react) for the infinite canvas
*   **AI SDK**: Google GenAI SDK (@google/genai), BRIA FIBO API
*   **Icons**: Lucide React
*   **Package Manager**: npm

## Architecture & File Structure
```
MeTime/
├── components/          # React components (UI, specific features)
├── services/            # API services (agentService.ts, briaService.ts)
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks (if applicable)
├── utils/               # Helper functions and utilities
├── types.ts             # TypeScript type definitions
├── constants.ts         # Global constants (if applicable)
├── App.tsx              # Main application component
├── index.tsx            # Entry point
└── public/              # Static assets
```

## Activity Categories
*   Drawing
*   Coloring Book
*   Miniature Painting (3D prints, wood, clay)
*   Fabric Painting
*   Flower Vase Customization
*   Watercolor Painting
*   Oil Painting
*   Jewelry Customization
*   Pattern Art (Mandala, Fractal, Zen, Geometric)
*   Game Character Design

## Key Features & AI Integration
*   **Master Image Generation**: Uses BRIA FIBO for JSON-native control.
    *   *Prompt Strategy*: Beautiful, calming art reference images.
*   **Dissection (Text Reasoning)**: Uses `gemini-2.5-flash`.
    *   *Prompt Strategy*: Expert artist persona, returns strict JSON for steps.
*   **Step Image Generation**: Uses BRIA FIBO's refinement pipeline.
    *   *Prompt Strategy*: Progressive refinement from master image using JSON controls.

## Development Workflow
*   **Start Dev Server**: `npm run dev` (Runs on http://localhost:5173 by default)
*   **Build for Production**: `npm run build`
*   **Preview Production Build**: `npm run preview`

## Coding Conventions
*   **Functional Components**: Use React functional components with Hooks.
*   **TypeScript**: Use interfaces/types for props and state. Avoid `any`.
*   **Styling**: Use utility-first Tailwind classes.
*   **State Management**: Use React Context for global state.
*   **AI Services**: Encapsulate API calls in `services/`. Handle errors and rate limits gracefully.

## Important Files
*   `README.md`: General project information and setup guide.
*   `services/agentService.ts`: Core logic for agent orchestration.
*   `services/briaService.ts`: BRIA FIBO API integration.

## Notes for Agents
*   Categories are defined in `types.ts` as `ActivityCategory` enum.
*   Ensure the infinite canvas interactions remain smooth; avoid heavy computations in the render loop.
*   The project uses `module` type in `package.json`, so use ESM syntax.
