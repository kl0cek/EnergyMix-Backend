import type { RequestHandler } from 'express';
import {
  getDailyEnergyMix,
  getOptimalChargingWindow,
} from '../services/energy.service';
import { parseWindowHours } from '../utils/validation.util';

export const getEnergyMix: RequestHandler = async (_req, res) => {
  const data = await getDailyEnergyMix();
  res.json({ data });
};

export const getChargingWindow: RequestHandler = async (req, res) => {
  const result = parseWindowHours(req.query.hours);
  if (!result.ok) {
    res.status(400).json({ error: result.message });
    return;
  }

  const data = await getOptimalChargingWindow(result.value);
  res.json({ data });
};
