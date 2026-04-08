"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const crashingEngine_1 = require("../services/crashingEngine");
const router = (0, express_1.Router)();
const activityValidation = [
    (0, express_validator_1.body)('activities').isArray({ min: 1 }).withMessage('At least one activity required'),
    (0, express_validator_1.body)('activities.*.id').notEmpty().withMessage('Activity ID required'),
    (0, express_validator_1.body)('activities.*.name').notEmpty().withMessage('Activity name required'),
    (0, express_validator_1.body)('activities.*.normalDuration').isFloat({ min: 0 }).withMessage('Normal duration must be >= 0'),
    (0, express_validator_1.body)('activities.*.crashDuration').isFloat({ min: 0 }).withMessage('Crash duration must be >= 0'),
    (0, express_validator_1.body)('activities.*.normalCost').isFloat({ min: 0 }).withMessage('Normal cost must be >= 0'),
    (0, express_validator_1.body)('activities.*.crashCost').isFloat({ min: 0 }).withMessage('Crash cost must be >= 0'),
    (0, express_validator_1.body)('activities.*.predecessors').isArray().withMessage('Predecessors must be an array'),
    (0, express_validator_1.body)('indirectCostPerDay').isFloat({ min: 0 }).withMessage('Indirect cost per day must be >= 0'),
];
// POST /api/optimize - Run full CPM + Crashing optimization
router.post('/optimize', activityValidation, (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            message: errors.array().map(e => e.msg).join('; '),
        });
    }
    try {
        const input = req.body;
        const result = crashingEngine_1.CrashingEngine.optimize(input);
        return res.json({ success: true, data: result });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            error: err.message || 'Optimization failed',
        });
    }
});
// POST /api/analyze - Just CPM analysis (no crashing)
router.post('/analyze', [
    (0, express_validator_1.body)('activities').isArray({ min: 1 }),
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Validation failed' });
    }
    try {
        const { activities } = req.body;
        const result = crashingEngine_1.CrashingEngine.optimize(activities);
        return res.json({ success: true, data: result });
    }
    catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
});
// GET /api/sample - Return sample dataset
router.get('/sample', (_req, res) => {
    const sample = {
        activities: [
            { id: 'A', name: 'Site Preparation', normalDuration: 6, crashDuration: 4, normalCost: 4000, crashCost: 6000, predecessors: [] },
            { id: 'B', name: 'Foundation', normalDuration: 8, crashDuration: 6, normalCost: 8000, crashCost: 10000, predecessors: ['A'] },
            { id: 'C', name: 'Framing', normalDuration: 10, crashDuration: 7, normalCost: 12000, crashCost: 16500, predecessors: ['B'] },
            { id: 'D', name: 'Electrical', normalDuration: 7, crashDuration: 5, normalCost: 6000, crashCost: 8000, predecessors: ['C'] },
            { id: 'E', name: 'Plumbing', normalDuration: 9, crashDuration: 6, normalCost: 9000, crashCost: 13500, predecessors: ['C'] },
            { id: 'F', name: 'HVAC', normalDuration: 5, crashDuration: 3, normalCost: 5000, crashCost: 7000, predecessors: ['C'] },
            { id: 'G', name: 'Insulation', normalDuration: 4, crashDuration: 3, normalCost: 3000, crashCost: 4500, predecessors: ['D', 'E', 'F'] },
            { id: 'H', name: 'Drywall', normalDuration: 8, crashDuration: 5, normalCost: 7000, crashCost: 10000, predecessors: ['G'] },
            { id: 'I', name: 'Finishing', normalDuration: 6, crashDuration: 4, normalCost: 5000, crashCost: 7000, predecessors: ['H'] },
        ],
        indirectCostPerDay: 1500,
    };
    res.json({ success: true, data: sample });
});
exports.default = router;
//# sourceMappingURL=api.js.map