---
name: testing-verification
description: Проверка качества кода, TypeScript, линтинг и написание тестов для Expo React Native проекта
---

# Тестирование и верификация — Expo React Native

## Стек
TypeScript strict · ESLint (Expo flat config) · Jest · React Native Testing Library

---

## Порядок проверки (всегда по шагам)

### Шаг 1: TypeScript
```bash
npx tsc --noEmit
```
Исправь ВСЕ ошибки типов перед тем как идти дальше.

Частые проблемы:
- `any` — замени на конкретный тип из `src/types/`
- Несовместимые DTO — проверь `src/types/api.ts`
- Алиасы (`providers`, `services`, `utils`) — проверь `tsconfig.json`

---

### Шаг 2: ESLint
```bash
npm run lint
```

ESLint конфигурация: Expo flat config, игнорирует `dist/*`.

Автофикс (безопасные правила):
```bash
# Если есть autofix скрипт
npm run lint -- --fix
```

Не автофиксируй логические ошибки — разбери их вручную.

---

### Шаг 3: Удали debug код
```tsx
// ❌ Удали
console.log('...');
console.error('test');
debugger;

// ✅ Оставь осмысленные TODO/FIXME
// TODO: подключить реальный API после backend-integration
// FIXME: оптимизировать ре-рендер
```

---

### Шаг 4: Тесты компонентов (React Native Testing Library)
```tsx
// src/components/ComponentName/__tests__/ComponentName.test.tsx
import { render, screen } from '@testing-library/react-native';
import { ComponentName } from '../index';

// Мок провайдеров если нужны
jest.mock('providers', () => ({
  useTheme: () => ({
    colors: { background: '#fff', text: '#000' },
  }),
}));

describe('ComponentName', () => {
  it('рендерит без крашей', () => {
    render(<ComponentName />);
  });

  it('показывает корректный текст', () => {
    render(<ComponentName title="Тест" />);
    expect(screen.getByText('Тест')).toBeTruthy();
  });
});
```

---

### Шаг 5: Тесты RTK Query хуков и сервисов
```tsx
// src/services/__tests__/yourDomain.test.ts
import { setupApiStore } from '../testUtils'; // если есть
import { yourDomainApi } from '../yourDomain';

describe('yourDomainApi', () => {
  it('getItems endpoint существует', () => {
    expect(yourDomainApi.endpoints.getItems).toBeDefined();
  });
});
```

---

### Шаг 6: Тесты утилит (чистые функции)
```tsx
// src/utils/__tests__/currency.test.ts
import { formatCurrency } from '../currency';

describe('formatCurrency', () => {
  it('форматирует корректно', () => {
    expect(formatCurrency(1000)).toBe('1 000 ₸');
  });

  it('обрабатывает 0', () => {
    expect(formatCurrency(0)).toBe('0 ₸');
  });
});
```

---

### Шаг 7: Запуск тестов
```bash
# Все тесты
npm test

# Один файл
npm test ComponentName

# Watch режим
npm test -- --watch

# С coverage
npm test -- --coverage
```

---

## Моки для алиасов

Если Jest не резолвит алиасы (`providers`, `services`, `utils`) — проверь `jest.config.js`:
```js
moduleNameMapper: {
  '^providers$': '<rootDir>/src/providers',
  '^services$': '<rootDir>/src/services',
  '^utils$': '<rootDir>/src/utils',
  '^api$': '<rootDir>/src/api',
  '^store$': '<rootDir>/src/store',
  '^components$': '<rootDir>/src/components',
}
```

---

## Моки провайдеров

```tsx
// Мок useTheme
jest.mock('providers', () => ({
  useTheme: () => ({
    colors: require('../../theme/color').LightColors,
  }),
  useAuth: () => ({
    user: null,
    token: null,
    isGuest: true,
  }),
}));

// Мок i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Мок expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
  useLocalSearchParams: () => ({}),
}));
```

---

## Цели по coverage

| Слой | Цель |
|------|------|
| `src/utils/` | 85%+ |
| `src/components/` | 70%+ |
| `src/services/` | 60%+ |
| `src/hooks/` | 70%+ |

Не гонись за 100% — покрой критичные пути.

---

## Ручная верификация перед PR

**Запусти приложение:**
```bash
npm run start
# или
npm run android
npm run ios
```

**Проверь:**
- [ ] Авторизация работает (auth gate `src/app/index.tsx`)
- [ ] Тема переключается (light/dark)
- [ ] Язык переключается (ru/kz/en)
- [ ] API вызовы проходят (Network в Metro или DevTools)
- [ ] Навигация работает корректно (push/replace/back)

---

## Чеклист финальной проверки

- [ ] `npx tsc --noEmit` — нет ошибок
- [ ] `npm run lint` — нет ошибок
- [ ] Удалены `console.log` и `debugger`
- [ ] Тесты написаны для компонентов и утилит
- [ ] `npm test` — все тесты проходят
- [ ] Приложение запускается без краша
- [ ] Навигация, тема, язык, API — работают
