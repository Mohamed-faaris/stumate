# Assignment Creator Feature

## Overview

Added the ability to assign forms to multiple groups at once. This feature allows form creators to efficiently distribute forms to multiple groups without having to create individual assignments.

## Files Created

### 1. `/api/form/assignment/route.ts`

API endpoint for managing form assignments to groups.

**Endpoints:**

- **POST** - Create assignments

  - Request: `{ formId: string, groupIds: string[] }`
  - Returns: Success message with count of assigned groups
  - Status: 201 on success, 400 for invalid data, 403 if not form owner

- **GET** - Fetch assignments for a form
  - Query param: `?formId=<formId>`
  - Returns: `{ success: true, groupIds: string[] }`
  - Status: 200 on success, 400 if no formId, 403 if not form owner

**Security:**

- Requires authentication
- Verifies user owns the form before allowing assignments
- Uses `onConflictDoNothing()` to prevent duplicate assignments

### 2. `/components/dev/AssignmentCreator.tsx`

React component for creating form-to-group assignments.

**Features:**

- Form selection with radio buttons (shows title and description)
- Group multi-select with checkboxes
- Shows which groups are already assigned (disabled but visible)
- Summary view before submission
- Toast notifications for success/error feedback
- Loading states during fetch and submit

**State Management:**

- `selectedFormId` - Currently selected form
- `selectedGroupIds` - Set of selected group IDs
- Uses React Query for data fetching and mutations

## Integration

### Updated `/app/(root)/dev/page.tsx`

- Imported `AssignmentCreator` component
- Added component to dev page layout below users/groups

## Database Schema

The `formAssignments` table was already configured to support multiple groups per form:

```typescript
formAssignments = createTable(
  "form_assignment",
  (d) => ({
    formId: d
      .uuid()
      .notNull()
      .references(() => forms.id),
    groupId: d
      .uuid()
      .notNull()
      .references(() => groups.id),
  }),
  (t) => [
    primaryKey({ columns: [t.formId, t.groupId] }),
    // ...
  ]
);
```

## Usage Flow

1. Navigate to the dev page
2. Scroll to "Assign Forms to Groups" section
3. Select a form from the available forms list
4. Check the groups you want to assign the form to
5. Review the summary
6. Click "Assign to Selected Groups"
7. Success toast will confirm the assignments

## Features

✅ Multiple group selection
✅ Form ownership verification
✅ Already-assigned groups are shown but disabled
✅ Toast notifications for user feedback
✅ Loading states during operations
✅ Summary view before submission
✅ Responsive grid layout for forms and groups
