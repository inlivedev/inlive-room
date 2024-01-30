import { existsSync, mkdirSync, writeFile } from 'fs';
import { dirname } from 'path';
import * as Sentry from '@sentry/nextjs';

export async function writeFiletoLocalStorage(path: string, data: Blob) {
  try {
    const fileBuffer = await data.arrayBuffer();
    const fileUint8Array = new Uint8Array(fileBuffer);
    ensureDirectoryExist(path);
    writeFile(path, fileUint8Array, (err) => {
      throw err;
    });
  } catch (error) {
    Sentry.captureException(error);
  }
}

export function ensureDirectoryExist(filePath: string) {
  const dir = dirname(filePath);
  if (existsSync(dir)) {
    return true;
  }
  ensureDirectoryExist(dir);
  mkdirSync(dir);
}
