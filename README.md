# Fastify Example

Fastify приложение с PostgreSQL, Redis и интеграцией Skinport API.

## Возможности

- **Purchases API**: система покупок товаров с транзакциями
- **Skinport API**: получение самых дешевых tradable/non-tradable предметов CS:GO
- **PostgreSQL**: база данных с миграциями и seed данными
- **Redis**: кэширование (5 минут для Skinport API)

## Запуск локально

### Docker (рекомендуется)

```bash
docker-compose up -d
```

Приложение будет доступно на `http://localhost:3050`

### Локальная разработка

```bash
npm install
npm run db:create
npm run migrate
npm run seed
npm run start:dev
```

## Файлы

- **`docker-compose.yaml`** - конфигурация Docker для PostgreSQL, Redis и приложения
- **`api.http`** - примеры HTTP запросов для тестирования API (REST Client)
- **`db/schema-export.sql`** - экспортированная схема базы данных

## API Endpoints

- `GET /health` - проверка состояния
- `POST /purchases` - создание покупки
- `GET /items` - получение 2 самых дешевых предметов (tradable + non-tradable)

## Скрипты

```bash
npm run build              # Компиляция TypeScript
npm run start              # Запуск production
npm run start:dev          # Запуск с hot-reload
npm run migrate            # Применить миграции
npm run seed               # Заполнить базу данными
npm run db:export-schema   # Экспорт схемы БД
```

