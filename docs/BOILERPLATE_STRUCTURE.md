# Expo Boilerplate Structure Guide

Audience: AI coding agents and future maintainers.

Purpose: use this repository as a reference boilerplate for a new Expo mobile app. This document describes the project shape, folder ownership, naming rules, and implementation patterns used in the current app.

## Project Identity

This is an Expo Router React Native app using TypeScript.

Core stack:

- Expo SDK 54 with `expo-router` as the app entry.
- React 19 and React Native 0.81.
- TypeScript strict mode.
- RTK Query and Axios for server APIs.
- AsyncStorage for persisted auth, language, and theme state.
- React Context for auth and theme providers.
- Redux Toolkit for RTK Query cache.
- Zustand for small cross-screen UI state.
- i18next and `react-i18next` for translations.
- EAS build profiles for development, preview, and production.
- Firebase Analytics and Firebase app integration.
- Expo notifications, location, maps, splash screen, and build properties plugins.

Primary app code lives in `src/`. The Expo Router app directory is `src/app/`, not a root-level `app/` folder.

## Root Files

Use these files as the top-level boilerplate control surface.

| Path | Role | Boilerplate rule |
| --- | --- | --- |
| `package.json` | Scripts, dependencies, Expo Router entry | Keep `"main": "expo-router/entry"`. Use `npm run start`, `android`, `ios`, `web`, and `lint`. |
| `app.config.js` | Expo app config | Replace app name, slug, bundle identifiers, icons, schemes, permissions, Firebase files, Google Maps key, EAS project id, and splash assets for each new app. |
| `eas.json` | EAS build profiles | Keep separate `development`, `preview`, and `production` profiles. Replace `EXPO_PUBLIC_API_URL` values per environment. |
| `tsconfig.json` | TypeScript and path aliases | Keep `strict: true`. Maintain path aliases for stable imports. |
| `babel.config.js` | Expo Babel config | Keep `babel-preset-expo` and `react-native-worklets/plugin` when Reanimated/worklets are used. |
| `eslint.config.js` | ESLint config | Uses Expo flat config and ignores `dist/*`. |
| `.env` | Local environment variables | Do not commit secrets. Public Expo env vars must use `EXPO_PUBLIC_` prefix. |
| `assets/` | Images, icons, fonts | Replace project-specific icons, logos, splash image, and fonts for each new app. |
| `README.md` | Human-facing app summary | Keep separate from this AI-oriented structure guide. |

## Required Environment Variables

The current app expects these environment-backed values:

- `EXPO_PUBLIC_API_URL`: API base URL used by `src/api.tsx`.
- `GOOGLE_SERVICES_INFO_PLIST`: iOS Firebase config path used by `app.config.js`.
- `GOOGLE_SERVICES_JSON`: Android Firebase config path used by `app.config.js`.
- `GOOGLE_MAPS_API_KEY`: Android Google Maps key used by `app.config.js`.

For a new app, replace all values and verify they match the new backend, Firebase project, Google Maps project, and EAS project.

## Source Folder Map

| Path | Responsibility | Rules |
| --- | --- | --- |
| `src/app/` | File-based routes and navigators | Use Expo Router groups and `_layout.tsx` files. Screens should be route files only. |
| `src/components/` | Reusable UI components, cards, sheets, modals, charts, loaders | Prefer `ComponentName/index.tsx`. Keep component logic UI-focused. |
| `src/hooks/` | Reusable React hooks | Put lifecycle, permissions, refetch, debounce, theme, and device hooks here. |
| `src/services/` | RTK Query endpoint modules and analytics helpers | Split endpoints by domain. Use `restApi.injectEndpoints`. |
| `src/providers/` | React Context providers | Auth and theme context live here. Export provider hooks from the folder barrel. |
| `src/store/` | App state setup | Redux store is for RTK Query. Zustand is for small client/UI state. |
| `src/theme/` | Theme tokens and map styles | Keep light/dark color tokens centralized. |
| `src/local/` | i18n setup and translation JSON | Current folder name is `local`, not `locales`. |
| `src/utils/` | Pure helper functions | No React components and no store coupling. |
| `src/types/` | Shared TypeScript models and API DTOs | Keep app models separate from backend DTOs. |
| `src/api.tsx` | Shared API base layer | Axios instance, interceptors, token refresh, RTK Query base API. |

## Import Aliases

Aliases are defined in `tsconfig.json`:

```json
{
  "components": ["./src/components"],
  "store": ["./src/store"],
  "utils": ["./src/utils"],
  "api": ["./src/api"],
  "providers": ["./src/providers"],
  "services": ["./src/services"]
}
```

Rules:

- Prefer aliases for stable app-level imports, for example `import { useAuth } from "providers"`.
- Relative imports are still used for nearby files and folders.
- Some files use `@/types`; if keeping that style, add an explicit `@/*` alias before expanding its usage.

## App Shell

Root shell: `src/app/_layout.tsx`.

Provider order:

1. `SafeAreaProvider`
2. `ReduxProvider`
3. `AuthProvider`
4. `ThemeProvider`
5. `GestureHandlerRootView`
6. `Slot`
7. `Toast`

Rules:

- Root layout returns `<Slot />`, not a root `<Stack />`.
- `useCachedResources()` must finish before rendering the app tree.
- Keep global providers in the root layout only.
- Add new global providers here only if they are required across route groups.

## Routing Architecture

Route groups live under `src/app/`.

```text
src/app/
  _layout.tsx
  index.tsx
  (auth)/
  (tabs)/
  (stacks)/
```

### Root Route

`src/app/index.tsx` is the auth gate.

Rules:

- Read auth state through `useAuth()`.
- Use `router.replace()` for auth gate redirects.
- Redirect authenticated or guest users to `/(tabs)/(main)`.
- Redirect unauthenticated users to `/(auth)`.
- Show `Loader` while auth state is loading.

### Route Groups

| Group | Layout | Role |
| --- | --- | --- |
| `(auth)` | `src/app/(auth)/_layout.tsx` | Unauthenticated flow using `Stack`. |
| `(tabs)` | `src/app/(tabs)/_layout.tsx` | Primary app shell using `Tabs` and a custom tab bar. |
| `(stacks)` | `src/app/(stacks)/_layout.tsx` | Pushed flows outside the main tab shell. |

Rules:

- Parentheses in folder names create route groups and are omitted from URLs.
- Keep `(auth)`, `(tabs)`, and `(stacks)` as sibling groups.
- Each navigator segment should have its own `_layout.tsx`.
- Use `index.tsx` for a folder's default screen.
- Use `[id].tsx` for dynamic detail routes.
- Register route screens explicitly in the nearest `_layout.tsx` when custom options are needed.
- Put header configuration in `_layout.tsx`, not inside screen files.

### Current Route Map

Auth routes:

```text
src/app/(auth)/
  _layout.tsx
  index.tsx
  choose-language/index.tsx
  sendcode/index.tsx
  register/index.tsx
```

Tab routes:

```text
src/app/(tabs)/
  _layout.tsx
  (main)/_layout.tsx
  (main)/index.tsx
  nearby.tsx
  reserve/_layout.tsx
  reserve/index.tsx
  reserve/reservehistoryr/index.tsx
  profile/_layout.tsx
  profile/index.tsx
  profile/editprofile/index.tsx
  profile/reservehistory/index.tsx
```

Stack routes:

```text
src/app/(stacks)/
  _layout.tsx
  archives/index.tsx
  archives/[id].tsx
  news/index.tsx
  news/[id].tsx
  settings/_layout.tsx
  settings/index.tsx
  settings/aboutus/index.tsx
  settings/appset/index.tsx
  settings/feedbacks/index.tsx
  settings/jointoteam/index.tsx
  settings/successform/index.tsx
  norates/_layout.tsx
  norates/index.tsx
  norates/branchpicker/index.tsx
  norates/moderation/index.tsx
  norates/withrates/index.tsx
```

Navigation rules:

- Use group-prefixed paths when crossing groups.
- Use `router.replace()` for auth gates and hard exits.
- Use `router.push()` for normal forward navigation.
- Use `router.back()` only when `router.canGoBack()` is true or the flow guarantees a back stack.
- Example paths: `/(tabs)/(main)`, `/(tabs)/profile/editprofile`, `/(auth)/sendcode`, `/(stacks)/settings`, `/(stacks)/news/[id]`.

## Components

Folder pattern:

```text
src/components/
  ComponentName/
    index.tsx
```

Rules:

- Use one folder per reusable component.
- Prefer named exports for components that are reused widely.
- Keep component-specific styles in the component file using `StyleSheet.create`.
- Use `makeStyles(colors)` when styles depend on theme colors.
- Keep domain-specific UI names explicit, for example `ReservationCard`, `CurrencyExchangeModal`, `BranchPickerSheet`.
- Use `src/components/index.tsx` only for stable exports. The current barrel is minimal and does not export every component.
- Remove duplicate draft files such as `index copy 2.tsx` before using this as a clean boilerplate.

Common component categories:

- Cards and lists: reservation cards, news cards, currency cards.
- Modals and sheets: language modal, cancel reservation modal, branch sheets.
- Charts: line charts and sparklines.
- Primitives: loader, skeleton, switch pill, currency flag.

## Hooks

Rules:

- Hooks must be named `useSomething`.
- Keep cross-cutting logic out of screens when it is reusable.
- Hooks may coordinate permissions, resources, app lifecycle, theme access, or refetch behavior.
- Pure formatting logic belongs in `src/utils/`, not `src/hooks/`.

Current key hooks:

- `useCachedResources`: loads fonts/assets and hides the splash screen.
- `useTheme`: returns `{ theme, colors }` from `ThemeProvider` and theme tokens.
- `useSystemTheme`: system theme helper.
- `usePushNotifications`: registers push tokens and handles notification deep links.
- `useUserLocation`: location access and user location behavior.
- `useRefetchOnLanguageChange`: refetch behavior after language changes.
- `useDebounce`: reusable debounce behavior.
- `useDiscountCalculator`: domain calculation hook.

## Providers And State

### Auth Provider

Path: `src/providers/Auth.tsx`.

Responsibilities:

- Store access token, user, loading state, guest state, auth errors, and language.
- Persist access and refresh tokens in AsyncStorage.
- Persist guest mode in AsyncStorage.
- Persist selected language through `STORE_LANGUAGE_KEY`.
- Register a global auth-failure callback through `setOnAuthFail`.
- Attach an Expo push token to the backend after login when available.

Rules:

- Use `useAuth()` to read auth state or call auth actions.
- Keep auth state transitions in the provider, not in individual screens.
- Guest mode is treated as authenticated for navigation.
- On logout, clear tokens and activate guest mode.
- New apps should replace domain-specific login/register/finalize behavior with their own auth contract.

### Theme Provider

Path: `src/providers/ThemeProvider.tsx`.

Responsibilities:

- Store `light` or `dark` theme.
- Initialize from AsyncStorage or system theme.
- Persist manual theme changes.

Rules:

- Use `useTheme()` from `src/hooks/useTheme.ts`.
- Add new color tokens to both `LightColors` and `DarkColors`.
- Do not hardcode repeated colors in screens when a theme token should exist.

### Redux Store

Path: `src/store/index.ts`.

Responsibilities:

- Configure Redux Toolkit store.
- Mount `restApi.reducer`.
- Add `restApi.middleware`.
- Reset app reducer on `LOGOUT`.

Rules:

- Use Redux mainly for RTK Query cache and server state.
- Add app reducers only when state is truly global and not better handled by Context or Zustand.

### Zustand Store

Path: `src/store/useBranchStore.ts`.

Current role:

- Stores selected branch.
- Tracks whether branch was manually selected.
- Allows automatic branch selection unless a manual choice exists.

Rules:

- Use Zustand for small cross-screen UI/client state.
- Keep stores focused on one domain.
- Replace `any` types with domain DTOs when adapting for a new app.

## API Layer

Base path: `src/api.tsx`.

Responsibilities:

- Create shared `axiosInstance`.
- Set `baseURL` from `process.env.EXPO_PUBLIC_API_URL`.
- Serialize array query params by repeating the same key.
- Attach `Authorization: Bearer <token>` from AsyncStorage.
- Attach `Accept-Language` header from stored app language.
- Refresh access tokens after eligible `401` responses.
- Queue concurrent refresh requests through a shared promise.
- Notify `AuthProvider` when refresh fails.
- Expose `restApi` from RTK Query.

Language mapping:

```text
ru -> ru
kz -> kk
en -> en
```

Endpoint module rules:

- Put endpoint groups in `src/services/`.
- Use `restApi.injectEndpoints`.
- Keep backend DTO imports in service files.
- Export generated RTK Query hooks from the endpoint module.
- Use cache tags from `restApi.tagTypes`.
- Keep analytics helpers separate from RTK Query services.

Current service files:

- `auth.ts`: auth endpoints.
- `client.ts`: client/profile-style endpoints.
- `user.ts`: user endpoints.
- `yesExchange.ts`: main domain API endpoints.
- `analytics.ts`: Firebase Analytics event helper, not an RTK Query endpoint file.
- `index.ts`: services barrel. Currently exports only `auth` and `client`; update this when standardizing imports.

## Internationalization

Base path: `src/local/`.

Files:

```text
src/local/i18n.ts
src/local/translations/index.ts
src/local/translations/en.json
src/local/translations/ru.json
src/local/translations/kz.json
```

Rules:

- Default language is `ru`.
- Language is stored in AsyncStorage with key `settings.lang`.
- Use `useTranslation()` in components and layouts.
- Add every new key to all translation JSON files.
- Keep user-facing strings out of components when they need localization.
- Keep app language codes separate from backend language codes when they differ, for example `kz` app language maps to `kk` API header.

## Theme

Base path: `src/theme/`.

Files:

- `color.ts`: `LightColors` and `DarkColors`.
- `mapStyles.ts`: map styling.

Rules:

- Every reusable color token should exist in both light and dark maps.
- Screens and components should access colors through `useTheme()`.
- For themed styles, use this pattern:

```ts
const { colors } = useTheme();
const styles = makeStyles(colors);
```

## Utils

Base path: `src/utils/`.

Rules:

- Utilities should be pure or platform helpers with clear side effects.
- Do not put React components here.
- Do not put RTK Query calls here.
- Good candidates: formatting, date calculations, phone normalization, currency display, notification setup.

Current utilities:

- `currency.ts`
- `formatCurrencyDisplay.ts`
- `formatNotificationSubtitle.ts`
- `nbkDateUtils.ts`
- `phoneUtils.ts`
- `pushNotifications.ts`

## Types

Base path: `src/types/`.

Rules:

- Keep app-level models in `src/types/index.ts`.
- Keep backend DTOs in `src/types/api.ts`.
- Import DTOs into services and screens instead of redefining response shapes.
- When creating a new app from this boilerplate, replace domain DTOs with the new backend contract.

Current type files:

- `index.ts`: user/auth-facing models.
- `api.ts`: backend DTOs and domain enums.

## Styling Rules

Use these conventions in new screens and components:

- Use `StyleSheet.create`.
- Use `makeStyles(colors)` when styles depend on the active theme.
- Keep styles close to the component unless shared across many components.
- Prefer theme tokens over hardcoded colors.
- Use `SafeAreaProvider` globally and safe-area hooks where layout needs device insets.
- Keep navigation headers in layout files.
- Keep screen files focused on data, actions, and view composition.

## Boilerplate Adaptation Checklist

When starting a new Expo app from this project, do these steps before feature work:

1. Replace project identity in `package.json` and `app.config.js`.
2. Replace iOS `bundleIdentifier` and Android `package`.
3. Replace `scheme` for deep links.
4. Replace EAS `projectId` and build/submit settings in `eas.json`.
5. Replace app icons, splash image, adaptive icon, logo, and fonts in `assets/`.
6. Replace Firebase files and environment variable references.
7. Replace Google Maps key and remove map permissions/plugins if not needed.
8. Replace `EXPO_PUBLIC_API_URL` values for all environments.
9. Replace API DTOs in `src/types/api.ts`.
10. Replace domain endpoint modules in `src/services/`.
11. Keep `src/api.tsx` only if the new app also needs Axios, token refresh, and RTK Query.
12. Replace auth behavior in `src/providers/Auth.tsx` with the new backend contract.
13. Decide whether guest mode is still needed.
14. Replace translation files and default language rules.
15. Replace theme tokens with the new design system colors.
16. Remove duplicate copied component files.
17. Remove Yes Exchange business screens and rebuild routes inside the same route-group structure.
18. Standardize component and services barrel exports.
19. Run `npm run lint`.
20. Start the app with `npm run start` and verify navigation, auth gate, theme, language, and API base URL.

## Keep, Replace, Or Remove

Keep as boilerplate:

- Expo Router route group architecture.
- Root provider shell in `src/app/_layout.tsx`.
- Typed routes experiment.
- Strict TypeScript.
- Theme provider and `useTheme()` pattern.
- i18n setup if the new app is multilingual.
- RTK Query base architecture if the new app uses a REST backend.
- EAS build profile separation.

Replace for every new app:

- App names, identifiers, icons, schemes, EAS ids.
- Firebase and Google Maps configuration.
- Backend URLs and DTOs.
- Auth endpoints and user model.
- Business screens, services, and translations.
- Analytics event names and payloads.

Remove if unused:

- Location permissions and hooks.
- Push notification setup.
- Firebase Analytics.
- Maps dependencies and config.
- Domain-specific components, charts, branch stores, and booking logic.

## AI Implementation Rules

When another AI uses this project as a boilerplate, follow these rules:

- Do not flatten `src/app` route groups unless the new app architecture is intentionally different.
- Do not move global providers out of `src/app/_layout.tsx`.
- Do not duplicate API base logic inside endpoint files.
- Do not place server state in Zustand when RTK Query already owns it.
- Do not place local UI state in Redux unless it needs global reducer behavior.
- Do not hardcode user-facing strings when i18n is enabled.
- Do not add a new folder type without first checking whether it fits `components`, `hooks`, `services`, `providers`, `store`, `theme`, `local`, `utils`, or `types`.
- Prefer replacing business-specific files over layering compatibility shims when creating a new app.
- Keep documentation and code examples synchronized with actual file paths.
