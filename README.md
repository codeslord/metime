# 🎨 Crafternia

> **Dissect your imagination. Build reality.**

**[🚀 Try the Live App](https://crafternia.vercel.app/)** • **[🎥 Watch the Demo](https://youtu.be/DVyiDgaXrns)**

---

## 💔 The Problem — Why We Built This

> *Remember when we were kids? When I was eight years old, I got this origami kit with a beautiful instruction manual. I wanted to make a paper plane. I followed the guide — step by step, fold by fold — and it worked perfectly. I'm sure you all have memories of creating crafts using those clear, simple manuals.*
>
> *But today? For most of our creative ideas... those manuals simply don't exist.*

**That world is gone.**

Today, when someone asks *"How do I make a paper craner?"*, they face:
- 47-minute YouTube tutorials with unskippable ads
- Blog posts buried under SEO filler
- Pinterest boards leading to broken links
- Instagram reels that flash by too fast to follow


**The beautiful simplicity of visual instruction sheets died with the 90s.** Except the IKEA manuals. The Tamiya model kits. The Simplicity sewing patterns. All gone. 

*"We all have a hobby. Whether it's woodworking, origami, or just tinkering — we love building things.*
>

>
> ***The beautiful art of visual instruction sheets is dead.***
>
> *Until now."*

### Why did it die?

Because professional instruction sheets were **expensive** — you needed expert makers, photographers, graphic designers, and print production. Only big companies could afford this.

**Crafternia brings it back for everyone.**

---

## ✨ The Solution — What Crafternia Does

Crafternia is an **AI-powered Infinite Craft Workbench** that transforms any craft idea into professional-quality visual instruction guides.

**Give it any idea:**
- *"Paper crane"*
- *"Clay turtle"*  
- *"Earrings in the shape of Santa Claus"*

**Get back:**

| Component | What It Does |
|-----------|--------------|
| 📷 **Master Reference Image** | Studio-quality photograph of your finished craft |
| 📦 **Materials List** | Everything you need, nothing you don't |
| 📋 **Step-by-Step Cards** | Chronological breakdown of the build process |
| 🎯 **Isolated Step Images** | Knolling-style visuals showing *only* the components for each step |

### 8 Supported Craft Categories

| | | | |
|:-:|:-:|:-:|:-:|
| 📄 Papercraft | 🏺 Clay | 🧵 Fabric | 🎭 Costumes & Props |
| 🪵 Woodcraft | 💎 Jewelry | 🧒 Kids Crafts | 🎨 Coloring Book | Drawing

---

## 🤖 The Architecture — Multi-Agent System with A2A Protocol

**This is the core innovation.** Crafternia is built on a **multi-agent architecture** where specialized AI agents communicate and collaborate using the **Agent-to-Agent (A2A) Protocol**.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          🎭 AGENT ORCHESTRATOR                              │
│                                                                             │
│   • Routes tasks based on capabilities & categories                         │
│   • Manages agent registration                                              │
│   • Tracks task state via A2A Protocol                                      │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
            ▼                         ▼                         ▼
   ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
   │ 📷 VISUALIZER   │     │ 🔬 DISSECTION   │     │ 📐 PATTERN      │
   │    AGENT        │     │    AGENT        │     │    AGENT        │
   │                 │     │                 │     │                 │
   │ Generates       │     │ Analyzes &      │     │ Creates         │
   │ master images   │     │ breaks down     │     │ templates &     │
   │ & step photos   │     │ complexity      │     │ pattern sheets  │
   └─────────────────┘     └─────────────────┘     └─────────────────┘
            │                         │                         │
            └─────────────────────────┼─────────────────────────┘
                                      │
                    ┌─────────────────▼─────────────────┐
                    │     🎨 CATEGORY-SPECIFIC AGENTS    │
                    │                                   │
                    │  ┌─────────────┬─────────────┐   │
                    │  │ Papercraft  │    Clay     │   │
                    │  ├─────────────┼─────────────┤   │
                    │  │ Woodcraft   │  Jewelry    │   │
                    │  ├─────────────┼─────────────┤   │
                    │  │ Kids Crafts │ Costumes    │   │
                    │  ├─────────────┼─────────────┤   │
                    │  │ Coloring    │  Drawing    │   │
                    │  └─────────────┴─────────────┘   │
                    │                                   │
                    │  Each agent has domain-specific   │
                    │  prompts & visual understanding   │
                    └───────────────────────────────────┘
```

### A2A Protocol — Agent Communication

Every agent speaks the same language through our **Agent-to-Agent Protocol**:

```typescript
interface A2AMessage {
    taskId: string;      // Unique identifier for tracking
    sender: string;      // Source agent
    recipient: string;   // Target agent or 'orchestrator'
    type: MessageType;   // TASK_REQUEST | TASK_RESPONSE | ERROR | STATUS_UPDATE
    payload: any;        // Task data
    timestamp: number;   // For observability
}
```

**Key Features:**
- ✅ **Unique Task IDs** for every operation
- ✅ **Full message tracking** from request to response
- ✅ **Standardized error handling** across all agents
- ✅ **Timestamps** for complete observability

### How Agents Collaborate

**Example: User requests *"Make a paper fox"***

```
1️⃣  User Input → Orchestrator receives request, identifies category
2️⃣  Orchestrator routes to PapercraftAgent via capability matching
3️⃣  PapercraftAgent generates domain-specific master image prompt
4️⃣  Master image generated → passed to DissectionAgent
5️⃣  DissectionAgent analyzes complexity, materials, steps
6️⃣  For each step → PapercraftAgent generates isolated step images
7️⃣  All results combined → displayed on infinite canvas
```

**Each step's output becomes input for the next — agents truly build on each other's work.**

### Why Specialized Agents?

A clay craft and a papercraft have *completely different* visual requirements:

| Papercraft Agent | Clay Agent |
|-----------------|------------|
| Flat pattern pieces | Rolled shapes, slabs |
| Fold lines & scoring | Fingerprint textures |
| Cut templates | Sculpting marks |
| Glue tabs | Blending surfaces |

**One generic prompt cannot do both well.** Specialized agents = specialized excellence.

---

## 🏆 Hackathon Criteria

| Criteria | How Crafternia Delivers |
|----------|------------------------|
| **Business Value** | Democratizes professional craft instruction creation |
| **Observability** | A2A Protocol with full message tracking, task IDs, timestamps |
| **Functionality** | End-to-end: idea → master image → dissection → step images |
| **Creativity** | Resurrects a dead medium with AI + spatial infinite canvas |
| **Impact** | Makes crafting accessible to millions struggling with tutorials |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | Modern UI framework |
| **TypeScript** | Type-safe development |
| **React Flow** (@xyflow/react) | Infinite canvas with pan/zoom |
| **Google Gemini AI** | Powers all generation |
| • `gemini-3-pro-image-preview` | Image generation |
| • `gemini-2.5-flash` | Text reasoning & dissection |
| **TailwindCSS** | Dark-mode UI styling |
| **Vite** | Fast build tool & dev server |
| **Lucide React** | Beautiful icons |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ installed
- A Google Gemini API key — [Get one here](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/Crafternia.git
cd Crafternia

# 2. Install dependencies
npm install

# 3. Configure environment
# Create a .env.local file in the root directory
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env.local

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
Crafternia/
├── services/
│   ├── a2a/                    # Agent-to-Agent Protocol
│   │   ├── AgentBase.ts        # Abstract base class for agents
│   │   └── types.ts            # A2A message types
│   ├── agents/
│   │   ├── CategoryAgentBase.ts    # Base for category agents
│   │   ├── DissectionAgent.ts      # Analyzes craft complexity
│   │   ├── VisualizerAgent.ts      # Generates images
│   │   ├── PatternAgent.ts         # Creates pattern sheets
│   │   └── categories/             # Specialized agents
│   │       ├── PapercraftAgent.ts
│   │       ├── ClayAgent.ts
│   │       ├── WoodcraftAgent.ts
│   │       └── ... (8 total)
│   └── orchestrator/
│       └── AgentOrchestrator.ts    # Central task router
├── components/                 # React UI components
├── pages/                      # Page components
├── contexts/                   # React Context providers
├── utils/                      # Helper functions
└── types.ts                    # TypeScript definitions
```

---

## 🎬 How It Works

1. **Describe It** — Type your craft idea and select a category
2. **See It** — A master reference image appears showing the finished craft
3. **Dissect It** — Click "Dissect" to analyze and generate steps
4. **Build It** — Step cards with isolated visuals expand on the canvas

```
User: "Make a clay turtle"
└─> Select: Clay category
    └─> Master Image: Studio photo of finished clay turtle
        └─> Click: Dissect
            └─> Materials Node: List of clay colors, tools
            └─> Step Cards:
                • Roll clay balls for body parts
                • Shape the shell dome
                • Attach legs and head
                • Add texture details
                (Each with isolated knolling images!)
```

---

## 💡 The Vision

> *Every grandparent should be able to create a professional instruction guide for their grandchild.*
> 
> *Every teacher should have beautiful visual aids without a design budget.*
> 
> *Every hobbyist should be able to share their craft in a format that actually works.*

**Crafternia isn't just an app. It's the resurrection of a superior instructional format — powered by an orchestra of AI agents working together.**

---

## 📄 License

This project is created for the Epiminds Multi-Agent Hackathon — December 2025.

---

**Built with ❤️ and a symphony of AI agents**

[🚀 Try the Live App](https://crafternia.vercel.app/)
