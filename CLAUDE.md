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
- Не уверен в API библиотеки — сверься через context7, не пиши по памяти

---

## Два слоя: процесс и знание проекта

Работа делится на два независимых слоя. Они дополняют друг друга, не заменяют.

**Слой 1 — ПРОЦЕСС (как работать).** Ведёт плагин **superpowers**.
Отвечает за дисциплину: прояснить → спроектировать → план → код → тесты → self-review.
Активируется сам в начале сессии — вручную вызывать не нужно.

**Слой 2 — ЗНАНИЕ ПРОЕКТА (что и по каким правилам строить).** Ведут личные Skills.
Отвечают за правила именно этого проекта: тема, i18n, RTK Query, структура папок.
superpowers их НЕ знает — это знание живёт только в Skills и в этом файле.

---

## Установленные плагины

**MCP-серверы (дают tools):**

- **context7** — актуальная документация библиотек. Используй перед кодом с незнакомым/обновлённым API (RTK Query, Expo Router).
- **figma** — чтение дизайнов по URL/node-id. Движок для skill `/ui-from-figma`.
- **codegraph** — граф кодовой базы: связи между файлами, импортами, функциями. Используй перед рефактором/изменением — найти где используется компонент/DTO и что сломается.

**Skills-плагин (даёт скиллы, не MCP-tools):**

- **superpowers** — движок процесса. Навязывает план → тесты → ревью. Авто-активируется при разработке фичи. Покрывает тестирование и проверку качества целиком (отдельного skill для тестов нет).

---

## Личные Skills (знание проекта)

- `/ui-from-figma` — создание UI из Figma по правилам проекта (тема, i18n, структура). Использует figma MCP.
- `/backend-integration` — подключение API через RTK Query `injectEndpoints`. Использует context7 для проверки сигнатур.
- `/research-docs` — исследование архитектуры и документации проекта.

---

## Кто что делает (наглядно)

| Задача                                                | Кто ведёт                           |
| ----------------------------------------------------- | ----------------------------------- |
| Спланировать перед кодом                              | superpowers                         |
| Написать тесты, self-review                           | superpowers                         |
| Цвета из `useTheme()`, стили `makeStyles`             | `/ui-from-figma`                    |
| Строки в en/ru/kz через `useTranslation()`            | `/ui-from-figma`                    |
| Читать дизайн из Figma                                | figma MCP (внутри `/ui-from-figma`) |
| Добавить RTK Query endpoint                           | `/backend-integration`              |
| Проверить API библиотеки                              | context7                            |
| Найти где используется компонент/DTO перед изменением | codegraph (точные связи)            |
| Разобраться в архитектуре/правилах проекта            | `/research-docs` (обзор + контекст) |

---

## Типичный флоу фичи

1. Описываешь задачу → **superpowers** сам начинает с вопросов и плана
2. UI → `/ui-from-figma` (подставляет правила проекта в код)
3. API → `/backend-integration` (RTK Query endpoint + типы)
4. Тесты и ревью → ведёт **superpowers** на этапе verify

Если задача чисто визуальная (новый экран из Figma) и superpowers тянет в TDD —
сначала UI через `/ui-from-figma`, тесты добавляются на этапе verify.
