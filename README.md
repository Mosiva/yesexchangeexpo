# YesExchange Mobile App

A modern mobile application for currency exchange services built with Expo and React Native. The app provides real-time exchange rates, branch locations, booking management, and news updates.

## Features

### Core Functionality
- **Currency Exchange Rates**: View real-time exchange rates for various currencies
- **Branch Locator**: Find nearby exchange branches using GPS location
- **Booking System**: Reserve currency exchange transactions (authenticated and guest users)
- **News Feed**: Stay updated with latest news and announcements
- **NBK Rates**: Integration with National Bank of Kazakhstan exchange rates
- **Rate History**: View historical exchange rate changes with charts

### User Features
- **Multi-language Support**: Available in Russian, English, and Kazakh
- **User Authentication**: OTP-based login and registration
- **Guest Booking**: Make reservations without creating an account
- **Profile Management**: Edit user profile and view booking history
- **Favorite Currencies**: Save preferred currencies for quick access
- **Push Notifications**: Receive alerts for rate changes and booking updates
- **Dark/Light Theme**: Automatic theme switching based on system preferences

### Additional Features
- **Maps Integration**: Interactive maps showing branch locations
- **QR Code Generation**: Generate QR codes for bookings
- **Feedback System**: Submit feedback and job applications
- **Archive**: Access historical exchange rate data

## Tech Stack

- **Framework**: Expo ~53.0.25
- **React Native**: 0.79.6
- **React**: 19.0.0
- **Routing**: Expo Router (file-based routing)
- **State Management**: 
  - Redux Toolkit (@reduxjs/toolkit)
  - Zustand (for branch store)
- **API Client**: RTK Query with Axios
- **Internationalization**: i18next & react-i18next
- **Forms**: React Hook Form with Yup/Zod validation
- **Maps**: React Native Maps & Expo Maps
- **Charts**: React Native Chart Kit
- **UI Components**: 
  - @gorhom/bottom-sheet
  - React Native Reanimated
  - React Native Gesture Handler

## Project Structure

```
src/
├── app/                    # Expo Router file-based routing
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── (stacks)/          # Stack navigation screens
│   └── _layout.tsx        # Root layout
├── components/             # Reusable UI components
├── hooks/                 # Custom React hooks
├── local/                 # i18n configuration and translations
├── providers/             # Context providers (Auth, Theme)
├── services/              # API services and client configuration
├── store/                 # State management (Zustand stores)
├── theme/                 # Theme configuration
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (>= 16.18.0)
- npm or yarn
- Expo CLI
- iOS Simulator (for macOS) or Android Emulator
- EAS CLI (for building)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd yesexchangeexpo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file if needed
   - Set `EXPO_PUBLIC_API_URL` for API endpoint
   - Configure Google Maps API key in `app.json` (Android)

4. Start the development server:
   ```bash
   npm start
   # or
   npx expo start
   ```

### Running on Devices

- **iOS Simulator**: Press `i` in the terminal or run `npm run ios`
- **Android Emulator**: Press `a` in the terminal or run `npm run android`
- **Physical Device**: Scan QR code with Expo Go app

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

## Building for Production

The project uses EAS Build for creating production builds.

### Development Build
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Preview Build
```bash
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

### Production Build
```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

## Configuration

### App Configuration
- App name: Yesexchange
- Bundle ID (iOS): `com.mosiva.yesexchangeexpo`
- Package (Android): `com.mosiva.yesexchangeexpo`
- Version: 1.0.0
- Build numbers: iOS (20), Android (20)

### Permissions
- Location access (for finding nearby branches)
- Push notifications
- Camera (for QR codes)

## API Integration

The app connects to a REST API with the following main endpoints:
- Authentication (`/api/v1/auth/*`)
- User management (`/api/v1/me/*`)
- Branches (`/api/v1/branches/*`)
- Exchange rates (`/api/v1/exchange-rates/*`)
- Bookings (`/api/v1/bookings/*`)
- News (`/api/v1/news/*`)
- NBK rates (`/api/v1/nbk/*`)

## Internationalization

The app supports three languages:
- Russian (ru) - Default
- English (en)
- Kazakh (kz)

Translations are stored in `src/local/translations/` and managed via i18next.

## Development Notes

- The app uses Expo Router for file-based routing
- State management combines Redux Toolkit (RTK Query) and Zustand
- Authentication state is managed via Context API
- Theme system supports automatic dark/light mode
- Location services are used for branch proximity calculations

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure linting passes: `npm run lint`
4. Submit a pull request

## License

Private project - All rights reserved

## Support

For issues and questions, please contact the development team.
