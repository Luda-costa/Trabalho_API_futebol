import path from 'node:path';
import { env } from '../config/env.js';

export function dataFile(name: string): string {
  return path.resolve(process.cwd(), env.DATA_DIR, name);
}
