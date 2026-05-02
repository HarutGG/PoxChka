# Requirements Document

## Introduction

This document specifies requirements for enhancing the PoxChka Finance Tracker application's user experience. The enhancements include removing unnecessary UI elements, implementing theme switching, creating a first-time user onboarding flow with username management, updating branding assets, and adding value-added features to improve user engagement and satisfaction.

## Glossary

- **Landing_Page**: The home page (/) displayed to unauthenticated users before login
- **Theme_Toggle**: A UI component that allows users to switch between dark and light display modes
- **Theme_System**: The existing ThemeContext that manages dark/light mode state
- **Onboarding_Flow**: The sequence of steps presented to first-time users after authentication
- **Username**: A user-chosen display name stored in the profiles table
- **Profile**: A database record in the profiles table containing user information
- **New_User**: A user who has authenticated but does not have a username in their profile
- **Returning_User**: A user who has authenticated and already has a username in their profile
- **Logo_Component**: The visual branding element displaying the PoxChka mountain/sun design
- **Dashboard**: The authenticated user interface at /dashboard

## Requirements

### Requirement 1: Remove Learn More Button

**User Story:** As a product owner, I want to remove the "Learn More" button from the landing page, so that users have a clearer call-to-action focused on getting started.

#### Acceptance Criteria

1. THE Landing_Page SHALL NOT display a "Learn More" button
2. THE Landing_Page SHALL display only the "Get Started" call-to-action button
3. THE Landing_Page SHALL maintain all other existing UI elements and styling

### Requirement 2: Theme Toggle Component

**User Story:** As a user, I want to toggle between dark and light modes, so that I can use the application in my preferred visual style.

#### Acceptance Criteria

1. THE Theme_Toggle SHALL display the current theme state (dark or light)
2. WHEN a user clicks the Theme_Toggle, THE Theme_System SHALL switch to the opposite theme
3. THE Theme_Toggle SHALL be visible on the Dashboard
4. THE Theme_Toggle SHALL use icons or visual indicators that clearly represent dark and light modes
5. WHEN the theme changes, THE application SHALL persist the preference to localStorage
6. WHEN a user returns to the application, THE Theme_System SHALL load their saved theme preference

### Requirement 3: Username Creation for New Users

**User Story:** As a new user, I want to create a username after signing in with Google, so that I can personalize my account.

#### Acceptance Criteria

1. WHEN a New_User completes Google authentication, THE Onboarding_Flow SHALL prompt the user to create a username
2. THE Onboarding_Flow SHALL display a form with a username input field
3. WHEN a user submits a username, THE application SHALL validate that the username is not empty
4. WHEN a user submits a valid username, THE application SHALL store the username in the Profile username field
5. WHEN username storage succeeds, THE application SHALL redirect the user to the Dashboard
6. WHEN a Returning_User authenticates, THE application SHALL NOT display the username creation prompt
7. THE application SHALL determine new vs returning users by checking if the Profile username field is null or empty

### Requirement 4: Username Storage and Retrieval

**User Story:** As a developer, I want to store and retrieve usernames from the database, so that user preferences persist across sessions.

#### Acceptance Criteria

1. THE Profile table SHALL include a username column of type TEXT
2. WHEN a username is saved, THE application SHALL update the Profile record for the authenticated user
3. WHEN a user loads the Dashboard, THE application SHALL retrieve the username from the Profile
4. THE application SHALL enforce Row Level Security policies ensuring users can only read and update their own Profile username

### Requirement 5: Username Editing

**User Story:** As a user, I want to edit my username after initial creation, so that I can update my display name if needed.

#### Acceptance Criteria

1. THE Dashboard SHALL display the current username
2. THE Dashboard SHALL provide a UI control to edit the username
3. WHEN a user clicks the edit control, THE application SHALL display an editable username input field
4. WHEN a user submits an updated username, THE application SHALL validate that the username is not empty
5. WHEN a user submits a valid updated username, THE application SHALL update the Profile username field
6. WHEN the username update succeeds, THE Dashboard SHALL display the updated username

### Requirement 6: Logo Replacement

**User Story:** As a product owner, I want to replace the current logo with the PoxChka mountain/sun design, so that the application displays consistent branding.

#### Acceptance Criteria

1. THE Landing_Page SHALL display the PoxChka mountain/sun logo instead of the letter "P" in a gradient box
2. THE Logo_Component SHALL use the provided PoxChka logo image asset
3. THE Logo_Component SHALL maintain appropriate sizing and visual hierarchy on the Landing_Page
4. THE Logo_Component SHALL be responsive and display correctly on mobile and desktop viewports

### Requirement 7: Enhanced Transaction Categorization

**User Story:** As a user, I want more granular transaction categories, so that I can better organize and analyze my spending patterns.

#### Acceptance Criteria

1. THE application SHALL support the following additional transaction categories: Shopping, Education, Travel, Insurance, Investments, Gifts, Subscriptions
2. WHEN a user creates a transaction, THE application SHALL display all available categories including the new ones
3. THE application SHALL maintain backward compatibility with existing transactions using the original categories
4. THE transactions table category constraint SHALL include all original and new category values

### Requirement 8: Quick Transaction Entry

**User Story:** As a user, I want to quickly add transactions from the dashboard, so that I can log expenses immediately without navigating away.

#### Acceptance Criteria

1. THE Dashboard SHALL display a quick-add transaction button or widget
2. WHEN a user clicks the quick-add control, THE application SHALL display a transaction entry form
3. THE transaction entry form SHALL include fields for amount, category, and description
4. WHEN a user submits the form with valid data, THE application SHALL create a new transaction record
5. WHEN transaction creation succeeds, THE Dashboard SHALL update to display the new transaction
6. THE quick-add form SHALL validate that amount is a positive number and category is selected

### Requirement 9: Transaction Summary Dashboard Widget

**User Story:** As a user, I want to see a summary of my spending at a glance, so that I can quickly understand my financial status.

#### Acceptance Criteria

1. THE Dashboard SHALL display a summary widget showing total income and total expenses for the current month
2. THE summary widget SHALL calculate totals by summing transaction amounts grouped by positive (income) and negative (expense) values
3. THE summary widget SHALL display the net balance (income minus expenses)
4. WHEN a new transaction is added, THE summary widget SHALL update to reflect the new totals
5. THE summary widget SHALL display currency amounts formatted with two decimal places

### Requirement 10: Recent Transactions List

**User Story:** As a user, I want to see my most recent transactions on the dashboard, so that I can quickly review my latest financial activity.

#### Acceptance Criteria

1. THE Dashboard SHALL display a list of the 10 most recent transactions
2. THE transaction list SHALL display each transaction's amount, category, description, and date
3. THE transaction list SHALL order transactions by created_at timestamp in descending order (newest first)
4. WHEN a user adds a new transaction, THE transaction list SHALL update to include the new transaction at the top
5. THE transaction list SHALL display a visual indicator distinguishing income (positive amounts) from expenses (negative amounts)

## Additional Notes

### Database Schema Changes Required

The profiles table requires a new username column:
```sql
ALTER TABLE public.profiles ADD COLUMN username TEXT;
```

The transactions table category constraint requires updating:
```sql
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_category_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_category_check 
  CHECK (category IN ('Food', 'Transport', 'Rent', 'Utilities', 'Salary', 'Entertainment', 'Health', 'Other', 'Shopping', 'Education', 'Travel', 'Insurance', 'Investments', 'Gifts', 'Subscriptions'));
```

### Technical Considerations

- The Theme_Toggle component should integrate with the existing ThemeContext
- Username validation should occur both client-side and server-side
- The onboarding flow should use Next.js routing to manage the username creation step
- Logo assets should be placed in the /public directory and optimized for web delivery
- Transaction operations should use Supabase RLS policies for security
- All database operations should handle errors gracefully and provide user feedback
