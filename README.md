# 🧘 Me Time

> **AI-guided mindful creativity. Step by step. Breath by breath.**

**Powered by [BRIA FIBO](https://bria.ai/fibo)** — JSON-native control meets agentic workflows for progressive visual guidance

**[🚀 Try the Live App](https://crafternia.vercel.app/)** • **[🎥 Watch the Demo](https://youtu.be/DVyiDgaXrns)**

---

## 💭 Inspiration

In our hyper-connected world, we've lost the art of *slowing down*. Meditation apps tell us to "just breathe," but many find empty stillness uncomfortable. **What if mindfulness could be active?** 

**Me Time** brings together two powerful ideas:
- **Mindful doing**: Creative activities that quiet the mind through gentle focus
- **Progressive guidance**: AI that breaks down intimidating art into calming, achievable steps

We were inspired by art therapy's proven benefits for mental well-being but wanted to make it accessible to everyone—no expensive classes, no artistic background required. Just you, simple materials, and an AI guide that meets you where you are.

---

## ✨ What It Does

**Me Time** is an AI-powered creative companion that transforms any artistic idea into a meditative, step-by-step journey using **BRIA FIBO's JSON-native control and progressive refinement**.

### Core Workflow

1. **Generate or Upload** — Create a beautiful reference image with AI, or upload your own inspiration
2. **Refine & Explore** — Use text prompts to iteratively refine any image until it feels right
3. **Break It Down** — AI dissects the final image into calm, progressive steps
4. **Create Together** — Follow visual guides that build naturally from simple to complete

### 10 Mindful Activities

| | | | | |
|:-:|:-:|:-:|:-:|:-:|
| ✏️ Drawing | 🎨 Coloring Book | 🪵 Miniatures | 🧵 Fabric Art | 💐 Vase Design |
| 🌊 Watercolor | 🖼️ Oil Painting | 💎 Jewelry | 🔮 Patterns | 🎮 Characters |

Each activity has a **specialized AI agent** with calming, activity-specific guidance.

### Key Features

- **Infinite Canvas**: Spatial workspace for organizing your creative journey
- **Progressive Refinement**: Images build naturally through FIBO's seed consistency  
- **Text-to-Image Refinement**: Connect text prompts to any image for instant variations
- **Upload & Refine**: Start with your own photos and evolve them with AI
- **Export Everything**: Download complete visual guides as ZIP/PDF

---

## 🛠️ How We Built It

### FIBO-Powered Multiagent Architecture

**Me Time** showcases FIBO's production-ready capabilities through a specialized agent system:

```
┌─────────────────────────────────────────────────────────────────────┐
│                      👤 USER INTERFACE LAYER                        │
├─────────────────────────────────────────────────────────────────────┤
│  ∞ Infinite Canvas (React Flow)     💬 Chat Interface              │
│  • Image Nodes (Master + Steps)     • Text Refinement Nodes        │
│  • Visual Connections               • Upload Interface             │
│  • Export Controls (ZIP/PDF)        • Activity Selector            │
└────────────┬────────────────────────────────────┬──────────────────┘
             │                                    │
             ▼                                    ▼
┌──────────────────────────────────┐  ┌─────────────────────────────┐
│   agentService.ts (Public API)   │◀─│  CanvasWorkspace.tsx        │
│   • generateMaster()             │  │  • Node State Management    │
│   • generateSteps()              │  │  • Edge Connections         │
│   • refineImage()                │  │  • Text→Image Refinement    │
└──────────────┬───────────────────┘  └─────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              🎭 AGENT ORCHESTRATION LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│                    AgentOrchestrator.ts                             │
│            Routes by activity type → Specialized Agent              │
├─────────────────────────────────────────────────────────────────────┤
│  ✏️ Drawing    🎨 Coloring    🌊 Watercolor   🖼️ Oil Painting       │
│  🪵 Miniature  🧵 Fabric      💐 Vase         💎 Jewelry            │
│  🔮 Patterns   🎮 Characters                                        │
├─────────────────────────────────────────────────────────────────────┤
│                 CategoryAgentBase.ts (Shared Logic)                 │
│  • getMasterImagePrompt()      - Activity-specific master prompts  │
│  • generateStepImage()          - Progressive refinement logic     │
│  • createRefinementInstruction()- Context-aware step prompts       │
└──────────────┬──────────────────────────────────┬─────────────────┘
               │                                   │
               ▼                                   ▼
┌──────────────────────────────┐    ┌────────────────────────────────┐
│  promptEngineering.ts        │    │    briaService.ts              │
│  (Gemini 2.5 Flash VLM)      │    │    (BRIA FIBO API)             │
├──────────────────────────────┤    ├────────────────────────────────┤
│ • Prompt → Structured JSON   │───▶│ • generateImage()              │
│ • Activity-aware reasoning   │    │   ├─ VLM-to-JSON translation  │
│ • 1000+ word prompts         │    │   ├─ Returns structured JSON  │
│ • Safety & aesthetics        │    │   └─ Returns seed             │
│                              │    │                                │
│ • dissectIntoSteps()         │    │ • refineImage()                │
│   ├─ Analyze final image     │    │   ├─ Same seed for coherence  │
│   ├─ Generate 5 steps        │    │   ├─ Modify JSON controls     │
│   └─ Materials & safety      │    │   └─ Progressive refinement   │
│                              │    │                                │
│ • refineStructuredPrompt()   │    │ • generateStructuredPrompt()   │
│   └─ Text → JSON mods        │    │   └─ Extract from uploads     │
└──────────────────────────────┘    └────────────────────────────────┘
                                                  │
                                                  ▼
                              ┌──────────────────────────────────────┐
                              │     BRIA FIBO External API           │
                              ├──────────────────────────────────────┤
                              │ • JSON-native image generation       │
                              │ • Seed-based consistency             │
                              │ • Disentangled refinement            │
                              │ • VLM structured prompt extraction   │
                              └──────────────────────────────────────┘

DATA FLOW EXAMPLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ MASTER GENERATION (from scratch)
   User Prompt → Orchestrator → WatercolorAgent
   → VLM (prompt engineering) → Structured JSON
   → FIBO API → {imageUrl, structuredPrompt, seed}
   → Canvas (Master Node)

2️⃣ TEXT REFINEMENT (existing image)
   Text Node + Image Node → agentService.refineImage()
   → VLM (refine structured prompt) → Modified JSON
   → FIBO API (same seed + new JSON) → Refined Image
   → Canvas (New Image Node connected via edge)

3️⃣ STEP DISSECTION (progressive build)
   Master Image → CategoryAgent.dissectIntoSteps()
   → VLM (analyze + create 5 steps)
   → For each step: CategoryAgent.generateStepImage()
      → VLM (calculate % complete) → Modified JSON
      → FIBO API (same seed + step JSON) → Step Image
   → Canvas (5 Step Nodes connected to Master)

4️⃣ UPLOAD + REFINE (user image)
   Upload File → FIBO.generateStructuredPrompt()
   → Extract JSON from image → Canvas Node
   → Can now refine via Text Nodes (flow #2)
```

### Technical Pipeline

#### 1. Image Generation (AI or Upload)
```typescript
// Option A: Generate from prompt
const structuredPrompt = await VLM.generateJSON(userPrompt, activity);
const result = await FIBO.generate(structuredPrompt);
// Returns: { imageUrl, structuredPrompt, seed }

// Option B: Upload existing image  
const uploadedImage = await uploadToCanvas(file);
// Use FIBO's structured prompt extraction for refinement
```

#### 2. Progressive Refinement (The Innovation)
```typescript
// Text-based refinement using FIBO's seed + structured prompt
const refinedResult = await FIBO.refine(
  originalStructuredPrompt,  // Preserve base composition
  originalSeed,              // Ensure visual consistency
  "add cherry blossoms"      // What to change
);
// Same background, lighting, style — only requested change applied
```

#### 3. Step Dissection
```typescript
// VLM analyzes final image, generates calming instructions
const steps = await VLM.dissect(finalImage, activity);
// Returns: materials, 5-step progression, safety tips

// Generate step images using FIBO refinement
for (let step of steps) {
  const stepImage = await FIBO.refine(
    masterStructuredPrompt,
    masterSeed,
    createGentleInstruction(step, completionPercent)
  );
}
```

### Activity-Specific Agents

Each agent provides calming, contextual guidance:

| Activity | Agent Approach |
|----------|----------------|
| **Watercolor** | "gentle washes build transparent layers" |
| **Drawing** | "light sketching lines find their form" |
| **Coloring** | "colors flow into outlined spaces" |
| **Patterns** | "repeating motifs emerge naturally" |

This isn't generic AI—it's **mindful, activity-aware guidance**.

---

## 🏔️ Challenges We Ran Into

1. **Visual Consistency Across Steps** — Ensuring each step image felt like the same artwork required mastering FIBO's seed + structured prompt workflow
2. **Upload Integration** — Enabling users to refine *uploaded* images (not just AI-generated) needed careful handling of structured prompt extraction
3. **Meditative Pacing** — Balancing AI capability with simplicity; we removed complexity to preserve the calm experience
4. **Text-to-Image Connections** — Building an intuitive canvas UI where text prompts visually connect to images they refine

---

## 🏆 Accomplishments That We're Proud Of

- **Production-Ready Agentic Workflow**: 10 specialized agents orchestrated seamlessly
- **Hybrid AI + Human Input**: Equally powerful whether generating from scratch or refining uploads
- **Progressive Refinement Mastery**: FIBO's seed consistency creates visually coherent step sequences
- **Calm-First UX**: Every interaction designed for mindfulness, not speed
- **Infinite Canvas Innovation**: Spatial interface that mirrors the creative thinking process

---

## 📚 What We Learned

- **FIBO's VLM-to-JSON translator** handles 1000+ word prompts beautifully—this enabled rich, nuanced image control
- **Seed + structured prompt** is the key to consistency; same base + refinement instruction = perfect progressive builds
- **Agent specialization matters**: Generic prompts can't capture the nuance of watercolor vs. oil painting
- **Calm requires intentionality**: We removed features that created anxiety (timers, complex menus) to preserve meditative flow

---

## 🌱 What's Next for Me Time

- **Guided Sessions**: 10-minute creativity sessions with breathing cues and ambient music
- **Community Library**: Share and discover calming projects from other creators  
- **HDR Support**: FIBO's 16-bit color space for professional watercolor/painting workflows
- **Voice Guidance**: Optional narrated instructions for eyes-free creation
- **Progress Journaling**: Visual timeline of creative growth over time

---

## 🔧 Built With

- **React 19** + **TypeScript** — Modern type-safe UI
- **BRIA FIBO** — 🌟 JSON-native image generation, progressive refinement
- **Google Gemini 2.5 Flash** — VLM reasoning, structured prompt generation
- **React Flow** (@xyflow/react) — Infinite canvas interface
- **TailwindCSS** — Dark-mode, calming aesthetics
- **Vite** — Fast dev experience
- **Lucide React** — Beautiful iconography

---

## 🏗️ Architecture

```
me-time/
├── services/
│   ├── briaService.ts              # FIBO API integration
│   │   ├── generateImage()         # Master generation
│   │   ├── refineImage()           # Progressive refinement
│   │   └── generateStructuredPrompt()  # Extract from uploads
│   ├── promptEngineering.ts        # VLM-to-JSON translation
│   ├── agents/
│   │   ├── CategoryAgentBase.ts           # Shared agent logic
│   │   │   ├── generateMasterImage()      # FIBO generation
│   │   │   ├── generateStepImage()        # FIBO refinement
│   │   │   └── createRefinementInstruction()  # Activity-aware
│   │   ├── categories/                    # 10 specialized agents
│   │   │   ├── DrawingAgent.ts
│   │   │   ├── WatercolorAgent.ts
│   │   │   ├── ColoringBookAgent.ts
│   │   │   └── ... (7 more)
│   │   └── orchestrator/
│   │       └── AgentOrchestrator.ts       # Routes by activity
│   └── agentService.ts             # Public API
├── components/                      # React UI components
│   ├── ChatInterface.tsx           # Text refinement UI
│   ├── CustomNodes.tsx             # Canvas node types
│   └── ...
├── pages/
│   └── CanvasWorkspace.tsx         # Main infinite canvas
└── types.ts                         # TypeScript definitions
```

---

## 🚀 Installation & Running

### Prerequisites
- Node.js 16+
- **BRIA API Key** — [Get one from Bria](https://bria.ai/)
- Google Gemini API Key — [Get one here](https://aistudio.google.com/apikey)

### Setup

```bash
# Clone repository
git clone https://github.com/your-repo/MeTime.git
cd MeTime

# Install dependencies  
npm install

# Configure environment
echo "VITE_BRIA_API_KEY=your_bria_key_here" > .env.local
echo "VITE_GEMINI_API_KEY=your_gemini_key_here" >> .env.local

# Start development server
npm run dev
# → http://localhost:5173

# Production build (optional)
npm run build && npm run preview
```

---

## 🏅 Hackathon Submission

### Applying For

**Primary: Best JSON-Native or Agentic Workflow**

**Why we excel here:**
- ✅ **Production-ready multiagent system** with 10 specialized activity agents + orchestrator
- ✅ **VLM-to-JSON pipeline** using Gemini 2.5 Flash to generate 1000+ word structured prompts
- ✅ **Scalable architecture** where adding new activities = creating one new agent class
- ✅ **Real workflow automation** — text prompt → structured JSON → image → dissection → progressive steps (fully automated)
- ✅ **Agents building on agents** — Master Agent creates base, Step Agents progressively refine using previous outputs

**Secondary: Best Controllability**

**Why we excel here:**
- ✅ **Disentangled refinement** — modify specific elements while preserving composition, lighting, background
- ✅ **Seed consistency** — all step images use same seed for visual coherence
- ✅ **Structured parameter control** — precise lighting, camera angle, color palette via JSON
- ✅ **Activity-aware prompts** — watercolor transparency ≠ oil painting texture (specialized control per medium)
- ✅ **Upload refinement** — extract structured prompts from user images, then refine them

**Tertiary: Best New User Experience or Professional Tool**

**Why we excel here:**
- ✅ **Infinite canvas workspace** for spatial organization (professional tool UX)
- ✅ **Hybrid generation + upload** workflow (unprecedented flexibility)
- ✅ **Text-to-image node connections** for intuitive refinement relationships
- ✅ **Export-ready outputs** (ZIP/PDF) for production use
- ✅ **Calming, meditative interface** designed for focus and well-being

### What Makes This Unique

**Most FIBO demos show**: "Here's an image generated from a prompt"  
**Me Time shows**: "Here's a production-ready system where specialized AI agents collaborate to create progressive visual sequences with perfect consistency—and you can refine any image (AI or uploaded) through natural text prompts"

The **agentic workflow** isn't superficial—it's core architecture. 10 agents, each with specialized knowledge, orchestrated to produce calm, mindful creative guidance.

---

## 📄 License

Created for the BRIA FIBO Hackathon — December 2025

---

**Built with 🧘 powered by BRIA FIBO**

[🚀 Try the Live App](https://metime.vercel.app/) • [🎥 Watch the Demo](https://youtu.be/link)
