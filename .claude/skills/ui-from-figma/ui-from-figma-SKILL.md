---
name: ui-from-figma
description: Создание UI компонентов и экранов из Figma для Expo Router / React Native проекта
---

# UI из Figma — Expo React Native

## Стек
Expo SDK 54 · React Native 0.81 · React 19 · TypeScript strict · Expo Router

---

## Перед началом
1. MCP Figma подключен: `claude mcp add figma`
2. Знаешь название компонента или экрана из Figma
3. Понимаешь — это переиспользуемый компонент (`src/components/`) или экран (`src/app/`)

---

## Компонент vs Экран

| Тип | Путь | Когда |
|-----|------|-------|
| Переиспользуемый компонент | `src/components/ComponentName/index.tsx` | Используется в 2+ местах |
| Экран (route) | `src/app/(group)/screen/index.tsx` | Это страница/экран |

---

## Создание компонента

### Структура папки
```
src/components/
  ComponentName/
    index.tsx
```

### Шаблон компонента
```tsx
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from 'providers';

export const ComponentName = () => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>...</Text>
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    text: {
      color: colors.text,
    },
  });
```

### Правила стилизации
- `StyleSheet.create` — обязательно
- `makeStyles(colors)` — когда стили зависят от темы
- Цвета ТОЛЬКО из `useTheme()` → `src/theme/color.ts` (LightColors / DarkColors)
- Никаких хардкодных цветов (`#fff`, `'white'`)
- `SafeAreaProvider` глобально уже подключен — используй хуки safe-area там, где нужны insets

---

## Создание экрана

### Куда добавить
```
src/app/
  (auth)/    — неавторизованный флоу (Stack навигатор)
  (tabs)/    — основной таб шелл
  (stacks)/  — пуш-флоу вне табов
```

### Шаблон экрана
```tsx
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'providers';

export default function ScreenName() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      {/* UI только — без API вызовов, это добавится в backend-integration */}
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });
```

### Регистрация экрана
- Добавь экран в ближайший `_layout.tsx` группы
- Header конфигурация — ТОЛЬКО в `_layout.tsx`, не в экране
- Динамические роуты: `[id].tsx`

---

## Навигация (только UI часть)
```tsx
import { router } from 'expo-router';

// Вперёд
router.push('/(stacks)/settings');

// Замена (auth gate)
router.replace('/(tabs)/(main)');

// Назад
if (router.canGoBack()) router.back();
```

---

## Интернационализация
- Все user-facing строки через `useTranslation()`
- Новый ключ → добавить в ВСЕ три файла: `src/local/translations/en.json`, `ru.json`, `kz.json`
- Никаких хардкодных строк в компонентах

---

## Импорты
```tsx
// Алиасы — для стабильных импортов
import { useTheme } from 'providers';
import { Button } from 'components';
import { formatCurrency } from 'utils';

// Относительные — для соседних файлов
import { MyHelper } from './helpers';
```

---

## Чеклист после создания UI

- [ ] Все цвета из `useTheme()` → нет хардкода
- [ ] Строки через `useTranslation()` → добавлены в en/ru/kz
- [ ] `StyleSheet.create` использован
- [ ] Экран зарегистрирован в `_layout.tsx` (если новый роут)
- [ ] Header в `_layout.tsx`, не в экране
- [ ] TypeScript strict — нет `any`
- [ ] Нет API вызовов (добавятся в `/backend-integration`)
- [ ] Placeholder для будущих data props: `// TODO: connect via backend-integration`
