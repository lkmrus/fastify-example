import Redis from 'ioredis';
import { getConfig } from '../src/config';

const { HOST, PORT } = getConfig().redis;

const newConnection = () =>
  new Redis(PORT, HOST, {
    lazyConnect: true,
    connectTimeout: 1000,
  });

type CacheValue = string | number | Record<string, any> | null;

class Cache {
  private readonly _connection: Redis;

  constructor() {
    this._connection = newConnection();
  }

  get connection(): Redis {
    return this._connection;
  }

  private _serialize(value: CacheValue): string | null {
    if (value === null || value === undefined) return null;

    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();

    try {
      return JSON.stringify(value);
    } catch (error) {
      return null;
    }
  }

  private _deserialize<T = any>(value: string | null): T | null {
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      return value as T;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.connection.get(key);
    return this._deserialize<T>(value);
  }

  async set(key: string, value: CacheValue, exSec: number = 3600): Promise<void> {
    const serializedValue = this._serialize(value);

    if (serializedValue === null) {
      await this.connection.del(key);
      return;
    }

    if (exSec > 0) {
      await this.connection.setex(key, exSec, serializedValue);
    } else {
      await this.connection.set(key, serializedValue);
    }
  }

  async delete(key: string): Promise<number> {
    return await this.connection.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.connection.exists(key);
    return result === 1;
  }

  async ttl(key: string): Promise<number> {
    return await this.connection.ttl(key);
  }

  async flush(): Promise<void> {
    await this.connection.flushdb();
  }
}

export default Cache;
