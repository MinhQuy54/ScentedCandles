import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import type { StoredFile } from './storage.type';

@Injectable()
export class LocalStorageService {
    constructor(private readonly config: ConfigService) {}

    private resolveUploadRoot(): string {
        return this.config.get<string>('UPLOAD_DIR', './uploads');
    }

    private resolvePublicBase(): string {
        return this.config.get<string>(
            'PUBLIC_BASE_URL',
            'http://localhost:3001',
        ).replace(/\/$/, '');
    }

    async upload(buffer: Buffer, originalName: string): Promise<StoredFile> {
        const uploadRoot = this.resolveUploadRoot()
        const publicBase = this.resolvePublicBase()

        const processed = await sharp(buffer)
        .resize({width: 1200, withoutEnlargement: true})
        .webp({quality: 80})
        .toBuffer();

        const filename = `${randomUUID()}.webp`;
        const key = `products/${filename}`;
        const absolutePath = join(uploadRoot, key);

        await fs.mkdir(join(uploadRoot, 'products'), { recursive: true });
        await fs.writeFile(absolutePath, processed);

        return {
            key,
            url: `${publicBase}/uploads/${key}`,
            size: processed.length,
            mimeType: 'image/webp',
        };
    }

    async delete(key: string): Promise<void> {
    const absolutePath = join(this.resolveUploadRoot(), key);
    await fs.unlink(absolutePath);
  }
}