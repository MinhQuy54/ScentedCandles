import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { RedisService } from './modules/redis/redis.service';

@Injectable()
export class AppService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async getHealthCheck() {
    const health = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      services: {
        database: { status: 'UNKNOWN', latencyMs: 0 },
        redis: { status: 'UNKNOWN', latencyMs: 0 },
        aiEngine: { status: 'UNKNOWN', latencyMs: 0 },
      },
    };

    // 1. Kiểm tra PostgreSQL Connection
    const dbStart = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
      health.services.database = {
        status: 'UP',
        latencyMs: Date.now() - dbStart,
      };
    } catch (err: any) {
      health.services.database = {
        status: 'DOWN',
        latencyMs: Date.now() - dbStart,
        error: err?.message || 'Database connection error',
      } as any;
      health.status = 'DEGRADED';
    }

    // 2. Kiểm tra Redis Connection
    const redisStart = Date.now();
    try {
      await this.redisService.getClient().ping();
      health.services.redis = {
        status: 'UP',
        latencyMs: Date.now() - redisStart,
      };
    } catch (err: any) {
      health.services.redis = {
        status: 'DOWN',
        latencyMs: Date.now() - redisStart,
        error: err?.message || 'Redis connection error',
      } as any;
      health.status = 'DEGRADED';
    }

    // 3. Kiểm tra AI Chatbot Engine
    const aiStart = Date.now();
    const aiUrl = this.configService
      .get<string>('AI_CHATBOT_URL', 'http://127.0.0.1:8001')
      .replace(/\/$/, '');
    try {
      const res = await fetch(`${aiUrl}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        health.services.aiEngine = {
          status: 'UP',
          latencyMs: Date.now() - aiStart,
        };
      } else {
        health.services.aiEngine = {
          status: 'DOWN',
          latencyMs: Date.now() - aiStart,
          error: `HTTP ${res.status}`,
        } as any;
        health.status = 'DEGRADED';
      }
    } catch (err: any) {
      health.services.aiEngine = {
        status: 'DOWN',
        latencyMs: Date.now() - aiStart,
        error: err?.message || 'AI Engine timeout / unreachable',
      } as any;
      health.status = 'DEGRADED';
    }

    if (health.services.database.status === 'DOWN') {
      health.status = 'DOWN';
    }

    return health;
  }
}
