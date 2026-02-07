# Грядка — Telegram Mini App

Интернет-магазин овощей и фруктов в формате Telegram Mini App.

## Стек технологий

- **Frontend:** React + Vite + TypeScript + @telegram-apps/sdk-react
- **Backend:** Python + Django + Django REST Framework
- **Database:** PostgreSQL
- **Cache:** Redis
- **Proxy:** Nginx
- **Deploy:** Docker Compose

## Локальный запуск

1. Скопируйте `.env.example` в `.env` и заполните значения:

```bash
cp .env.example .env
```

2. Запустите через Docker Compose:

```bash
docker-compose -f docker-compose.local.yml up --build
```

3. Приложение будет доступно:
   - Frontend: http://localhost (через nginx) или http://localhost:5173 (напрямую)
   - Backend API: http://localhost/api/ или http://localhost:8000/api/
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

## Продакшен деплой

```bash
docker-compose up --build -d
```

## Структура проекта

```
├── frontend/          # React + Vite + TypeScript
├── backend/           # Django API + Telegram Bot
├── docker/            # Nginx и Vite Docker конфиги
├── docker-compose.yml          # Продакшен
├── docker-compose.local.yml    # Разработка
└── .env.example
```

## API Endpoints

### Public
- `GET /api/products/` — список товаров
- `GET /api/products/:id/` — детали товара
- `GET /api/categories/` — категории
- `GET /api/settings/` — настройки магазина
- `GET /api/users/me/` — текущий пользователь

### Orders
- `POST /api/orders/` — создать заказ
- `GET /api/orders/` — мои заказы

### Chat
- `GET /api/chat/messages/` — мои сообщения
- `POST /api/chat/messages/send/` — отправить сообщение

### Admin
- `GET/POST /api/products/admin/` — управление товарами
- `GET/POST /api/categories/admin/` — управление категориями
- `GET /api/orders/admin/` — все заказы
- `GET /api/admin/analytics/` — аналитика
- `GET /api/chat/admin/rooms/` — чаты с клиентами
