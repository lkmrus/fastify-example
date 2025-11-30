interface RedisConfig {
  HOST: string;
  PORT: number;
}

interface DbConfig {
  HOST: string;
  PORT: string;
  USER: string;
  PASSWORD: string;
  DATABASE: string;
}

interface AppConfig {
  PORT: number;
}

export interface Config {
  app: AppConfig;
  redis: RedisConfig;
  db: DbConfig;
}
