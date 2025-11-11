# Schema Structure

The database schema has been separated into different files organized by domain/feature:

## Files Overview

### `base.ts`

- Contains `createTable` helper function for creating tables with the `stumate_` prefix

### `user.ts`

- User table with authentication and role management
- User metadata for additional user information
- Enums: `UserRole` ("USER", "ADMIN", "DEV"), `Gender` ("MALE", "FEMALE", "OTHER")

### `auth.ts`

- `accounts` - Next.js Auth provider accounts
- `sessions` - User sessions management
- `verificationTokens` - Email verification tokens

### `form.ts`

- `forms` - Form definitions
- `formSections` - Sections within forms

### `form-response.ts`

- `formQuestions` - Individual questions in form sections
- `formResponses` - Individual responses to questions

### `group.ts`

- `groups` - Group definitions
- `groupsMembers` - Group membership with roles
- Enum: `GroupRole` ("MEMBER", "MODERATOR", "ADMIN")

### `relations.ts`

- All Drizzle ORM relations defined here
- Includes user relations, account relations, and session relations

### `index.ts`

- Central export point that re-exports all schema definitions
- Maintains backward compatibility with existing imports

## Import Example

Instead of importing everything from one large file, you can now:

```typescript
import { users, forms } from "~/server/db/schema";
```

All exports are still available through `index.ts`, so existing code will continue to work.
