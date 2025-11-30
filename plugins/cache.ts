import Redis from 'ioredis';
import { getConfig } from '../src/config';
const { HOST, PORT } = getConfig().redis;

const newConnection = () =>
  new Redis(PORT, HOST, {
    lazyConnect: true,
    connectTimeout: 1000,
  });

const serialize = (value: Record<string, any>) => {
  if (!value) return null;

  try {
    return JSON.stringify(value);
  } catch (error) {
    return null;
  }
};

const deserialize = (value: string | null) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

class Cache {
  private readonly _connection;

  constructor() {
    this._connection = newConnection();
  }

  get connection(): Redis {
    return this._connection;
  }

  _serialize(value: any): string | null {
    return serialize(value);
  }

  _deserialize(value: string | null): Record<string, any> | null {
    if (!value) return null;

    return deserialize(value);
  }

  async get(key: string): Promise<Record<string, any> | null> {
    return this._deserialize(await this.connection.get(key));
  }

  async set(key: string, value: Record<string, any>, exSec: number = 0): Promise<void> {
    const serializedValue = this._serialize(value);
    if (!serializedValue) {
      this.connection.del(key);
    }
    await this.connection.set(key, serializedValue as string, 'EX', exSec);
  }
}

export default Cache;
