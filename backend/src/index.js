"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const api_1 = __importDefault(require("./routes/api"));

const app = (0, express_1.default)();

const PORT = process.env.PORT || 3002;

// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));

// Routes
app.use('/api', api_1.default);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Not Found' });
});

// Error handler
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
});

app.get("/", (_req, res) => {
    res.send("OK");
});

app.listen(PORT, () => {
    console.log(`🚀 CPM Optimizer API running on http://localhost:${PORT}`);
});

exports.default = app;
//# sourceMappingURL=index.js.map
