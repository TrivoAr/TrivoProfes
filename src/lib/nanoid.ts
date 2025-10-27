// Helper to create short IDs for salidas
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);

export function createShortId(): string {
  return nanoid();
}
