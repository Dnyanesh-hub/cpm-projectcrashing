# ⬡ CPM Optimizer — Project Time-Cost Analysis

Full-stack production-ready application for Project Time-Cost Optimization using **Critical Path Method (CPM)** and **Activity Crashing**.

---

## 🎯 What It Does

Helps project managers find the **optimal project duration** that minimizes total cost by analyzing:

- **Direct Costs** — Normal & crash costs per activity
- **Indirect Costs** — Daily overhead / fixed costs
- **CPM Network** — Automatically computes ES, EF, LS, LF, Slack, and Critical Path
- **Crashing Engine** — Iteratively reduces project duration at minimum cost

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+  |  npm 9+

```bash
# 1. Install all dependencies
cd cpm-optimizer
cd backend && npm install && cd ../frontend && npm install && cd ..

# 2. Terminal A — Start backend (port 3001)
cd backend && npm run dev

# 3. Terminal B — Start frontend (port 5173)
cd frontend && npm run dev

# Open http://localhost:5173
```

---

## 🐳 Docker (Production)

```bash
# Build & start both services
docker-compose up --build

# App → http://localhost
# API → http://localhost:3001

# Stop
docker-compose down
```

---

## 🧪 Tests

```bash
cd backend
npm test              # Run unit tests
npm test -- --coverage  # With coverage report
```

---

## 📁 Structure

```
cpm-optimizer/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── cpmEngine.ts       # CPM algorithm (cycle detect, topo sort, forward/backward pass)
│   │   │   └── crashingEngine.ts  # Crashing + cost optimization engine
│   │   ├── routes/api.ts          # REST endpoints
│   │   └── index.ts               # Express server
│   └── __tests__/engines.test.ts  # Unit tests
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── forms/ActivityForm.tsx      # Activity input + validation
│       │   ├── graph/NetworkGraph.tsx      # D3.js interactive DAG
│       │   ├── charts/CostChart.tsx        # Cost vs Time (Recharts)
│       │   ├── charts/CrashTable.tsx       # Step-by-step simulation table
│       │   ├── charts/ActivityProgressChart.tsx
│       │   └── ResultsPanel.tsx            # Main dashboard
│       ├── store/index.ts                  # Zustand state
│       └── services/api.ts                 # API client
│
├── docker-compose.yml
└── README.md
```

---

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/optimize` | Full CPM + crashing optimization |
| POST | `/api/analyze` | CPM analysis only |
| GET | `/api/sample` | Sample construction project data |
| GET | `/health` | Health check |

### Optimize Request Body
```json
{
  "activities": [
    {
      "id": "A",
      "name": "Foundation",
      "normalDuration": 8,
      "crashDuration": 5,
      "normalCost": 8000,
      "crashCost": 11000,
      "predecessors": []
    }
  ],
  "indirectCostPerDay": 1500
}
```

---

## 🧠 Algorithm

### CPM Engine
1. **Cycle Detection** — DFS-based; throws error on cyclic dependencies
2. **Topological Sort** — Kahn's algorithm
3. **Forward Pass** — ES = max(predecessors' EF), EF = ES + duration
4. **Backward Pass** — LF = min(successors' LS), LS = LF - duration
5. **Slack** = LS - ES; Critical Path = activities with slack = 0

### Crashing Engine
1. Start from normal state (Step 0)
2. On each iteration: find critical-path activities with remaining crash time
3. Pick lowest **crash slope** = (CrashCost - NormalCost) / (NormalDuration - CrashDuration)
4. Crash by 1 day; recompute CPM; compute Total Cost = DirectCost + Duration × IndirectRate
5. Repeat until no activities remain crashable
6. **Optimal** = step with minimum Total Cost

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite 5 |
| Styling | TailwindCSS 3 + Glassmorphism |
| State | Zustand |
| Graph | D3.js v7 |
| Charts | Recharts |
| Backend | Node.js + Express + TypeScript |
| Validation | Express Validator |
| Testing | Jest + ts-jest |
| Container | Docker + Nginx |

---

## ☁️ Cloud Deployment

**Frontend → Vercel:**
```bash
cd frontend && npm run build
npx vercel --prod
```

**Backend → Railway / Render / Fly.io:**
```bash
cd backend && npm run build
# Set PORT=3001, NODE_ENV=production, FRONTEND_URL=https://your-app.vercel.app
node dist/index.js
```

---

MIT License
