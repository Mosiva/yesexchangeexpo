# CLAUDE.md

## Проект
Expo Router · React Native 0.81 · TypeScript strict · Expo SDK 54

## Запуск
```bash
npm run start      # Metro bundler
npm run android    # Android
npm run ios        # iOS
npm run lint       # ESLint
```

## Структура
- Роуты: `src/app/` — группы `(auth)`, `(tabs)`, `(stacks)`
- Компоненты: `src/components/ComponentName/index.tsx`
- API: `src/api.tsx` (base) + `src/services/` (endpoints)
- Стейт: RTK Query → серверный, Zustand → UI, Context → Auth/Theme
- Типы: `src/types/index.ts` (app) + `src/types/api.ts` (DTO)
- i18n: `src/local/translations/` → en / ru / kz

## Алиасы импортов
`components`, `store`, `utils`, `api`, `providers`, `services`

## Главные правила
- Цвета только из `useTheme()` — никаких хардкодных значений
- Стили через `StyleSheet.create` + `makeStyles(colors)`
- Строки через `useTranslation()` → добавлять в en + ru + kz
- Header конфиг в `_layout.tsx`, не в экране
- Провайдеры только в `src/app/_layout.tsx`
- Серверный стейт — RTK Query, не Zustand

## Skills
- `/ui-from-figma` — создание UI из Figma
- `/backend-integration` — подключение API
- `/testing-verification` — тесты и проверка качества
- `/research-docs` — исследование архитектуры и документации
