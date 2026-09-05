import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";


@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    constructor(
        private readonly configService: ConfigService
    ) { }

    onModuleInit() {
        const host = this.configService.get<string>('REDIS_HOST')
        const port = this.configService.get<number>('REDIS_PORT', 6379)

        this.client = new Redis({
            host,
            port: Number(port),
            lazyConnect: true,
            retryStrategy: (times) => Math.min(times * 100, 3000),
        });

        this.client.connect().catch((err) => {
            console.warn(`[RedisService] Khong the ket noi toi Redis ${host}:${port}`, err)
        })
    }

    onModuleDestroy() {
        this.client.disconnect()
    }

    getClient(): Redis {
        return this.client;
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }
    async set(key: string, value: string, ttlSeconds?: number): Promise<'OK'> {
        if (ttlSeconds) {
            return this.client.set(key, value, 'EX', ttlSeconds);
        }
        return this.client.set(key, value);
    }
    async del(key: string): Promise<number> {
        return this.client.del(key);
    }
}
