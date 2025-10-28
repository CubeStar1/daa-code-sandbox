# Problems Components

This folder contains all the components related to the problems listing page, organized for better maintainability and reusability.

## Components

### Core Components

- **`problems-table.tsx`** - Main table component using TanStack Table
- **`problems-filters.tsx`** - Search and filtering controls
- **`problem-table-columns.tsx`** - Table column definitions and logic
- **`problems-loading-skeleton.tsx`** - Loading state component
- **`problems-error-state.tsx`** - Error state component

### Hooks

- **`use-problems-data.tsx`** - Custom hook for fetching and managing problems data

### Index

- **`index.ts`** - Barrel export for all components

## Structure

```
components/problems/
├── index.ts                      # Exports all components
├── problem-table-columns.tsx     # Table column definitions
├── problems-filters.tsx          # Filter and search controls
├── problems-table.tsx            # Main table component
├── problems-loading-skeleton.tsx # Loading state UI
├── problems-error-state.tsx      # Error state UI
├── use-problems-data.tsx         # Data fetching hook
└── README.md                     # This file
```

## Usage

The main problems page (`app/problems/page.tsx`) now imports and uses these components:

```tsx
import {
  useProblemTableColumns,
  ProblemsFilters,
  ProblemsTable,
  ProblemsLoadingSkeleton,
  ProblemsErrorState,
  useProblemsData,
  useFilteredProblems,
} from "@/components/problems"
```

## Features

- **TanStack Table Integration**: Professional table with built-in sorting, filtering, and column management
- **Responsive Design**: Works on desktop and mobile devices
- **Search & Filters**: Global search, difficulty filter, status filter, and column visibility controls
- **Loading States**: Skeleton loading animation while data loads
- **Error Handling**: User-friendly error messages with retry functionality
- **Type Safety**: Full TypeScript support with proper type definitions

## Benefits of Component Split

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other parts of the app
3. **Testing**: Easier to test individual components
4. **Code Organization**: Cleaner, more organized codebase
5. **Performance**: Better tree-shaking and code splitting opportunities
