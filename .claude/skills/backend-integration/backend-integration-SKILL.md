---
name: backend-integration
description: Подключение API через RTK Query и Axios, управление состоянием через Redux/Zustand/Context
---

# Backend интеграция — RTK Query + Axios + Zustand

## Стек
RTK Query · Axios · Redux Toolkit · Zustand · AsyncStorage · React Context (Auth/Theme)

---

## Правило выбора стейт-менеджера

| Тип состояния | Инструмент |
|--------------|------------|
| Серверные данные (API) | RTK Query (`src/services/`) |
| Глобальный UI / cross-screen | Zustand (`src/store/`) |
| Auth + Theme | React Context (`src/providers/`) |
| Локальный UI (внутри экрана) | `useState` / `useReducer` |

❌ Не клади серверный стейт в Zustand — им владеет RTK Query  
❌ Не клади локальный UI стейт в Redux без необходимости

---

## Добавление нового API endpoint

### 1. Создай или найди файл сервиса в `src/services/`
```
src/services/
  auth.ts         — auth endpoints
  client.ts       — client/profile endpoints
  user.ts         — user endpoints
  yesExchange.ts  — domain endpoints
  analytics.ts    — Firebase Analytics (не RTK Query!)
  index.ts        — barrel экспорт
```

### 2. Добавь endpoint через `restApi.injectEndpoints`
```tsx
// src/services/yourDomain.ts
import { restApi } from 'api';
import type { YourDTO, YourResponseDTO } from 'src/types/api';

export const yourDomainApi = restApi.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query<YourResponseDTO, void>({
      query: () => '/items',
      providesTags: ['Items'],
    }),
    createItem: builder.mutation<YourResponseDTO, YourDTO>({
      query: (body) => ({
        url: '/items',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Items'],
    }),
  }),
});

export const { useGetItemsQuery, useCreateItemMutation } = yourDomainApi;
```

### 3. Добавь тег в `src/api.tsx` если нужен новый тип
```tsx
// в restApi tagTypes добавь новый тег
tagTypes: ['Auth', 'User', 'Items'],
```

### 4. Экспортируй из `src/services/index.ts`
```tsx
export * from './yourDomain';
```

---

## Использование RTK Query в экране/компоненте
```tsx
import { useGetItemsQuery, useCreateItemMutation } from 'services';

export default function ItemsScreen() {
  const { data, isLoading, isError, refetch } = useGetItemsQuery();
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorView onRetry={refetch} />;

  return <ItemsList items={data} />;
}
```

---

## Типы из `src/types/`

```tsx
// src/types/index.ts — app-level модели (user-facing)
// src/types/api.ts  — backend DTOs

// ✅ Импортируй DTO в сервисе
import type { UserDTO } from 'src/types/api';

// ❌ Не переопределяй response shape прямо в сервисе
```

---

## Auth через `useAuth()`
```tsx
import { useAuth } from 'providers';

const { user, token, logout, isGuest } = useAuth();
```

- Token refresh происходит автоматически в `src/api.tsx` — не трогай
- При 401 и неудачном refresh → `AuthProvider` уведомляется сам
- Редирект после logout: `router.replace('/(auth)')`

---

## Zustand — для маленького cross-screen стейта
```tsx
// Пример: src/store/useBranchStore.ts
import { create } from 'zustand';

interface BranchStore {
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch) => void;
}

export const useBranchStore = create<BranchStore>((set) => ({
  selectedBranch: null,
  setSelectedBranch: (branch) => set({ selectedBranch: branch }),
}));
```

- Один store = один домен
- Замени `any` типы на конкретные DTO

---

## Firebase Analytics
```tsx
// src/services/analytics.ts — НЕ RTK Query, просто хелпер
import analytics from '@react-native-firebase/analytics';

export const trackEvent = async (name: string, params?: object) => {
  await analytics().logEvent(name, params);
};
```

---

## Импорты
```tsx
import { useGetItemsQuery } from 'services';
import { useAuth } from 'providers';
import { restApi } from 'api';
import { useBranchStore } from 'store';
```

---

## Чеклист после интеграции

- [ ] Endpoint через `restApi.injectEndpoints` — не дублируй базовую логику
- [ ] DTOs импортированы из `src/types/api.ts`
- [ ] RTK Query хуки экспортированы из сервис файла
- [ ] Новый сервис добавлен в `src/services/index.ts`
- [ ] Loading и error состояния обработаны в UI
- [ ] Zustand используется только для UI/client стейта
- [ ] TypeScript strict — нет `any`
- [ ] Нет тестов (добавятся в `/testing-verification`)
