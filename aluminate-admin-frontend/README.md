# Aluminate Admin Frontend

## Overview

The Aluminate Admin Frontend is a web application designed for managing features within the Aluminate platform. This project provides an intuitive interface for administrators to create, view, and manage features effectively.

## Features

- **Feature Management**: Users can create new features with a simple form that requires only a name.
- **Feature List**: A table displays all existing features, allowing for easy management and oversight.

## Project Structure

```
aluminate-admin-frontend
├── app
│   ├── (protected)
│   │   └── features
│   │       ├── page.tsx
│   │       └── components
│   │           ├── FeatureForm.tsx
│   │           └── FeatureTable.tsx
│   └── api
│       └── features
│           └── route.ts
├── lib
│   ├── api
│   │   └── features.ts
│   └── validators
│       └── feature.ts
├── types
│   └── feature.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

1. **Clone the repository**:
   ```
   git clone <repository-url>
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the application**:
   ```
   npm start
   ```

## API Endpoints

- **Create Feature**: POST `/api/features`
- **Get Features**: GET `/api/features`

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.