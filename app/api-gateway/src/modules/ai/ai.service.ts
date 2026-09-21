import {
  BadGatewayException,
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';
import type { Response } from 'express';

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly configService: ConfigService) { }

  onModuleInit() {
    // Tự động ping giữ ấm chatbot service mỗi 10 phút (Render free plan ngủ sau 15 phút)
    const TEN_MINUTES = 10 * 60 * 1000;
    setInterval(() => this.keepAliveChatbot(), TEN_MINUTES);
    setTimeout(() => this.keepAliveChatbot(), 5000);
  }

  private async keepAliveChatbot(): Promise<void> {
    const baseUrl = this.configService
      .get<string>('AI_CHATBOT_URL', 'http://127.0.0.1:8001')
      .replace(/\/$/, '');
    try {
      await fetch(`${baseUrl}/health`).catch(() => { });
    } catch {
      // Ignore background keep-alive errors
    }
  }

  async streamChat(
    message: string,
    res: Response,
    signal?: AbortSignal,
  ): Promise<void> {
    const baseUrl = this.configService
      .get<string>('AI_CHATBOT_URL', 'http://127.0.0.1:8001')
      .replace(/\/$/, '');

    let upstream: globalThis.Response;
    try {
      upstream = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({ message }),
        signal,
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }
      this.logger.error(
        'Không kết nối được chatbot',
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException('Chatbot đang không khả dụng');
    }

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => '');
      this.logger.error(`Chatbot lỗi ${upstream.status}: ${detail}`);
      throw new BadGatewayException('Chatbot trả về lỗi');
    }

    res.status(200);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Connection', 'keep-alive');

    const nodeStream = Readable.fromWeb(
      upstream.body as import('node:stream/web').ReadableStream,
    );

    await new Promise<void>((resolve, reject) => {
      nodeStream.on('error', (error) => {
        this.logger.error('Lỗi stream chatbot', error.stack);
        reject(error);
      });
      res.on('close', () => {
        nodeStream.destroy();
        resolve();
      });
      nodeStream.on('end', () => resolve());
      nodeStream.pipe(res);
    });
  }
}
