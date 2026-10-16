import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { ServiceUnavailableException } from '@nestjs/common';
let active = 0;
const dummy = `scrypt$131072$8$1$${'0'.repeat(32)}$${'0'.repeat(128)}`;
async function derive(password: string, salt: string) {
  if (active >= 4) throw new ServiceUnavailableException('Autenticação ocupada. Tente novamente.');
  active++;
  try {
    return await new Promise<Buffer>((resolve, reject) => scrypt(password, salt, 64,
      { N: 131072, r: 8, p: 1, maxmem: 160 * 1024 * 1024 }, (e, key) => e ? reject(e) : resolve(key)));
  } finally { active--; }
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$131072$8$1$${salt}$${(await derive(password, salt)).toString('hex')}`;
}
export async function verifyPassword(password: string, stored: string | null) {
  const valid = stored !== null && /^scrypt\$131072\$8\$1\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(stored);
  const parts = (valid ? stored : dummy).split('$');
  const key = await derive(password, parts[4]);
  return timingSafeEqual(key, Buffer.from(parts[5], 'hex')) && valid;
}
