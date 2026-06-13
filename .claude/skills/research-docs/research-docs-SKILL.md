---
name: research-docs
description: Исследование архитектуры, документации и кодовой базы Expo React Native проекта
disable-model-invocation: true
---

# Исследование документации проекта

## Как вызвать
```
/research-docs <вопрос>
```

Примеры:
- `/research-docs как работает авторизация`
- `/research-docs куда добавить новый экран`
- `/research-docs как подключить новый API endpoint`
- `/research-docs как переключается тема`

---

## Процесс

1. Прочитай `BOILERPLATE_STRUCTURE.md` в корне — это главный источник истины
2. Найди релевантные файлы по структуре проекта ниже
3. Прочитай код, не угадывай
4. Дай конкретный ответ со ссылками на реальные файлы

---

## Карта проекта

### Ключевые файлы для быстрого ответа

| Вопрос | Куда смотреть |
|--------|---------------|
| Как работает авторизация? | `src/providers/Auth.tsx`, `src/app/index.tsx` |
| Как работает тема? | `src/providers/`, `src/theme/color.ts` |
| Как добавить экран? | `src/app/(group)/_layout.tsx` + роут файл |
| Как добавить API? | `src/api.tsx`, `src/services/`, `src/types/api.ts` |
| Как добавить перевод? | `src/local/translations/en.json`, `ru.json`, `kz.json` |
| Откуда берётся baseURL? | `.env` → `EXPO_PUBLIC_API_URL` → `src/api.tsx` |
| Как работает навигация? | `src/app/_layout.tsx`, группы `(auth)/(tabs)/(stacks)` |
| Где хранится стейт? | RTK Query → `src/services/`, Zustand → `src/store/`, Context → `src/providers/` |
| Какие алиасы доступны? | `tsconfig.json` → `components`, `store`, `utils`, `api`, `providers`, `services` |
| Где env переменные? | `.env`, `.env.example`, `eas.json` |

---

## Структура папок

```
src/
  app/              — Expo Router маршруты
    _layout.tsx     — Root shell (провайдеры)
    index.tsx       — Auth gate
    (auth)/         — Неавторизованный флоу
    (tabs)/         — Основные табы
    (stacks)/       — Push экраны
  components/       — Переиспользуемые UI компоненты
  hooks/            — Кастомные хуки
  services/         — RTK Query endpoints + analytics
  providers/        — React Context (Auth, Theme)
  store/            — Redux (RTK Query) + Zustand
  theme/            — color.ts, mapStyles.ts
  local/            — i18n, переводы
  utils/            — Чистые функции
  types/            — TypeScript модели и DTO
  api.tsx           — Axios instance + RTK Query base
```

---

## Правила проекта (коротко)

**Архитектура:**
- Провайдеры ТОЛЬКО в `src/app/_layout.tsx`
- Не дублируй базовую API логику в endpoint файлах
- Серверный стейт → RTK Query, не Zustand
- Локальный UI стейт → `useState`, не Redux

**Стилизация:**
- `StyleSheet.create` всегда
- `makeStyles(colors)` для тематических стилей
- Цвета ТОЛЬКО из `useTheme()` → `src/theme/color.ts`

**Навигация:**
- `router.replace()` для auth gate
- `router.push()` для обычной навигации
- Header конфиг в `_layout.tsx`, не в экране

**Типизация:**
- App модели → `src/types/index.ts`
- Backend DTOs → `src/types/api.ts`
- TypeScript strict, нет `any`

**i18n:**
- Все строки через `useTranslation()`
- Новый ключ → добавить в en + ru + kz
- `kz` → API header `kk`

---

## Официальная документация

- Expo Router: https://docs.expo.dev/router/introduction/
- RTK Query: https://redux-toolkit.js.org/rtk-query/overview
- Zustand: https://zustand-demo.pmnd.rs/
- React Native: https://reactnative.dev/docs/getting-started
- EAS Build: https://docs.expo.dev/build/introduction/

---

## После исследования

Дай ответ в формате:
1. **Короткий ответ** — что нужно знать
2. **Конкретные файлы** — куда смотреть / куда добавлять
3. **Пример кода** — если применимо
