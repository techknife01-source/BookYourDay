import { Router } from 'express';
import { PlannerController } from '../controllers/plannerController.js';
import { plannerRateLimiter } from '../middleware/plannerRateLimiter.js';

const router = Router();

// Route to parse natural language prompts into structured PlannerRequest
router.post('/parse-prompt', PlannerController.parsePrompt);

// Route to generate a new AI day plan
router.post('/generate', plannerRateLimiter, PlannerController.generatePlan);

// Route to regenerate or modify an existing day plan
router.post('/regenerate', plannerRateLimiter, PlannerController.regeneratePlan);

export default router;
