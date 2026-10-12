# ScentMatch Frontend

Архітектурний каркас frontend-частини дипломного проєкту ScentMatch (React + TypeScript + Vite).

## Швидкий старт

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm run dev
```

Переконайтеся, що `VITE_API_BASE_URL` вказує на ASP.NET Core Web API.

## Скрипти

| Команда | Призначення |
| --- | --- |
| `npm run dev` | Локальний dev-сервер |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Перегляд production-збірки |
| `npm run lint` | Oxlint |

## Структура `src`

- `app` — providers, router, layouts, route guards
- `pages` — сторінки-композиції (зараз placeholder)
- `features` — бізнес-сценарії (`auth` підготовлено першим)
- `shared` — API-клієнт, UI-заглушки, константи, конфіг
- `styles` — глобальні стилі та design tokens

Модулі каталогу, порівняння, підбору тощо додаватимуться у `features/` / `entities/` під час наступних етапів.

## Дизайн-система

Візуальна мова зафіксована в `src/styles/tokens.css` та `typography.css`.

- світла тема за замовчуванням, повноцінна темна (`data-theme`)
- вибір теми в `localStorage` (`scentmatch.theme`)
- cream / charcoal + champagne gold
- serif display (**Cormorant Garamond**) + sans UI (**Manrope**)
- базові компоненти в `src/shared/ui`

## Auth / API

Інтеграція з `scentmatch-backend` (`API/Controllers/AuthController.cs`):

| Метод | Шлях | Примітка |
| --- | --- | --- |
| POST | `/api/auth/register` | `username`, `email`, `password`, optional `firstName`/`lastName` |
| POST | `/api/auth/login` | `email`, `password` → `AuthResponse` |
| POST | `/api/auth/refresh` | `{ refreshToken }` → новий `AuthResponse` |
| POST | `/api/auth/logout` | `{ refreshToken }` → 204 |
| GET | `/api/auth/me` | Bearer access token → `UserResponse` |

Ролі backend: `User`, `Admin`. Токени в JSON body → `sessionStorage`.  
`VITE_API_BASE_URL` за замовчуванням: `http://localhost:5190`.  
CORS backend дозволяє `http://localhost:5173`.

Demo users (якщо seed увімкнено): `user@scentmatch.local` / `User1234!`, `admin@scentmatch.local` / `Admin123!`.
