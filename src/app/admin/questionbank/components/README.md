# Question Bank Components

This directory contains all the modular components for the Question Bank feature. Components are organized by functionality and purpose for better maintainability.

## Directory Structure

```
components/
├── display/                   # Components for displaying questions
│   ├── QuestionCard.tsx      # Individual question card component
│   ├── QuestionGrid.tsx      # Grid layout for questions
│   ├── QuestionList.tsx      # List layout for questions
│   └── EmptyState.tsx        # Empty state when no questions found
├── dialogs/                   # Dialog/Modal components
│   ├── AddQuestionDialog.tsx # Modal for adding new questions
│   ├── EditQuestionDialog.tsx # Modal for editing questions
│   └── BulkUploadDialog.tsx  # Modal for bulk importing questions
├── forms/                     # Form components (future implementation)
│   ├── QuestionForm.tsx      # Main question form
│   ├── QuestionLayersForm.tsx # 3-layer content system
│   ├── QuestionOptionsForm.tsx # Question options with images
│   └── QuestionMetadataForm.tsx # Subject, topic, difficulty
├── ui/                        # Reusable UI components
│   ├── LoadingSpinner.tsx    # Loading state display
│   ├── ErrorAlert.tsx        # Error state display
│   ├── math-display.tsx      # Math equation display
│   └── math-input.tsx        # Math equation input
├── QuestionBankHeader.tsx     # Header with search and actions
├── QuestionFilters.tsx        # Advanced filtering panel
└── index.ts                   # Component exports
```

## Component Categories

### Display Components
Components responsible for rendering questions in different layouts and states.

- **QuestionCard**: Individual question display with actions (edit, delete, duplicate)
- **QuestionGrid**: Grid layout container for multiple questions
- **QuestionList**: List layout container for multiple questions
- **EmptyState**: User-friendly message when no questions are found

### Dialog Components
Modal components for user interactions that require focused attention.

- **AddQuestionDialog**: Complete form for creating new questions
- **EditQuestionDialog**: Form for modifying existing questions
- **BulkUploadDialog**: Interface for uploading multiple questions from files

### UI Components
Reusable components for common UI patterns and specialized functionality.

- **LoadingSpinner**: Consistent loading state across the application
- **ErrorAlert**: Standardized error display with retry actions
- **MathDisplay**: Renders mathematical equations and formulas
- **MathInput**: Input component for mathematical expressions

### Layout Components
Components that handle the overall layout and navigation of the question bank.

- **QuestionBankHeader**: Top navigation with search, filters, and actions
- **QuestionFilters**: Advanced filtering interface with multiple criteria

## Usage Examples

### Basic Question Display
```tsx
import { QuestionCard } from './components';

<QuestionCard
  question={question}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onDuplicate={handleDuplicate}
  viewMode="grid"
/>
```

### Question List/Grid
```tsx
import { QuestionGrid, QuestionList } from './components';

// Grid view
<QuestionGrid
  questions={questions}
  onEditQuestion={handleEdit}
  onDeleteQuestion={handleDelete}
  onDuplicateQuestion={handleDuplicate}
/>

// List view
<QuestionList
  questions={questions}
  onEditQuestion={handleEdit}
  onDeleteQuestion={handleDelete}
  onDuplicateQuestion={handleDuplicate}
/>
```

### Dialogs
```tsx
import { AddQuestionDialog, EditQuestionDialog } from './components';

<AddQuestionDialog
  isOpen={showAddDialog}
  isCreating={isCreating}
  newQuestion={newQuestion}
  onClose={handleClose}
  onSubmit={handleSubmit}
  onQuestionChange={setNewQuestion}
/>
```

## Design Principles

### 1. Single Responsibility
Each component has a single, well-defined purpose and handles one specific aspect of the question bank functionality.

### 2. Composition over Inheritance
Components are designed to be composed together rather than extended, promoting flexibility and reusability.

### 3. Props Interface
All components have well-defined TypeScript interfaces for their props, ensuring type safety and clear contracts.

### 4. Consistent Styling
Components use the shared UI library and follow consistent styling patterns across the application.

### 5. Accessibility
Components include proper ARIA labels, keyboard navigation support, and screen reader compatibility.

## Component Dependencies

### External Dependencies
- `@/components/ui/*` - Shared UI component library
- `@/hooks/use-toast` - Toast notification system
- `@/constants/types` - TypeScript type definitions
- `lucide-react` - Icon library

### Internal Dependencies
- `../types` - Question bank specific types
- `../utils` - Utility functions
- `../constants` - Configuration constants

## Future Enhancements

### Planned Components
1. **QuestionForm** - Comprehensive question creation/editing form
2. **QuestionLayersForm** - Specialized form for the 3-layer content system
3. **QuestionOptionsForm** - Form for managing question options with images
4. **QuestionMetadataForm** - Form for question metadata (subject, topic, etc.)
5. **QuestionPreview** - Read-only preview of questions
6. **QuestionStats** - Analytics and statistics display
7. **QuestionTemplates** - Predefined question templates

### Enhancements
1. **Virtualization** - For handling large numbers of questions efficiently
2. **Drag & Drop** - For reordering questions and bulk operations
3. **Real-time Updates** - WebSocket integration for collaborative editing
4. **Advanced Filters** - More sophisticated filtering options
5. **Export/Import** - Enhanced bulk operations with validation

## Testing Strategy

### Unit Tests
Each component should have comprehensive unit tests covering:
- Rendering with different props
- User interactions and event handling
- Error states and edge cases
- Accessibility compliance

### Integration Tests
Test component interactions and data flow:
- Dialog opening/closing workflows
- Filter and search functionality
- CRUD operation flows
- Multi-component coordination

### Visual Tests
Ensure consistent visual appearance:
- Component styling across different states
- Responsive design on various screen sizes
- Theme compatibility (light/dark mode)
- Cross-browser compatibility

This modular architecture ensures that the Question Bank feature is maintainable, testable, and extensible while providing a great user experience.
