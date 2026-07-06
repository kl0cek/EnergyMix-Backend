import { Router } from 'express';
import { getChargingWindow, getEnergyMix } from '../controllers/energy.controller';

const router = Router();

router.get('/mix', getEnergyMix);
router.get('/charging-window', getChargingWindow);

export default router;
