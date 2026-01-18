# Context Management Features

## What Are Contexts?

Contexts allow you to separate your finances into different categories like Personal, Work, or Business. Each context has its own set of transactions, budgets, savings goals, investments, and subscriptions.

---

## Available Operations

### 1. Create Context
**How to:**
1. Click the context selector in the header
2. Click "Create New Context"
3. Enter a name (e.g., "Personal", "Work", "Side Business")
4. Select a type (Home, Work, or Business)
5. Click "Create"

**Result:** New context is created and automatically selected

---

### 2. Switch Context
**How to:**
1. Click the context selector in the header
2. Click on any context in the list
3. See success toast notification

**Result:** You're now viewing data for that context

**Visual Indicator:** Currently active context has blue border and background

---

### 3. Edit Context
**How to:**
1. Click the context selector in the header
2. Find the context you want to edit
3. Click the **edit icon (pencil)** on the right side
4. Update the name or type
5. Click "Save Changes"

**Result:** Context is updated with new information

**Note:** Editing a context doesn't affect any of your data (transactions, budgets, etc.)

---

### 4. Delete Context
**How to:**
1. Click the context selector in the header
2. Find the context you want to delete
3. Click the **delete icon (trash)** on the right side
4. Confirm deletion in the dialog

**Result:** Context is removed from the list

**Important Notes:**
- ⚠️ You cannot delete your last remaining context
- ⚠️ Deleting a context does NOT delete your data
- Your transactions, budgets, etc. remain in the database
- The data is just not visible until you access it from another context or recreate the context with the same ID

**Safety Features:**
- Delete button is disabled when only 1 context exists
- Confirmation dialog prevents accidental deletion
- If you delete the active context, app automatically switches to another context

---

## Context Management UI

### Context Selector Layout
```
┌─────────────────────────────────┐
│ Personal                    Home │ ← Click to open
└─────────────────────────────────┘

Opens modal:
┌────────────────────────────────────┐
│ Select Context                  ✕  │
├────────────────────────────────────┤
│ ┌──────────────────────────────┐  │
│ │ Personal         🔵          │  │ ← Active (blue)
│ │ Home             [✏️] [🗑️]  │  │
│ └──────────────────────────────┘  │
│ ┌──────────────────────────────┐  │
│ │ Work                         │  │
│ │ Work             [✏️] [🗑️]  │  │
│ └──────────────────────────────┘  │
│ ┌──────────────────────────────┐  │
│ │ Business                     │  │
│ │ Business         [✏️] [🗑️]  │  │
│ └──────────────────────────────┘  │
│                                    │
│ [+ Create New Context]             │
└────────────────────────────────────┘
```

### Button Actions
- **Click context name** → Switch to that context
- **Click edit icon (✏️)** → Open edit modal
- **Click delete icon (🗑️)** → Open delete confirmation

---

## Testing Context Management

### Test Scenario 1: Create Multiple Contexts
1. Create "Personal" context (Home type)
2. Create "Work" context (Work type)
3. Create "Side Business" context (Business type)
4. Verify all three appear in the selector

### Test Scenario 2: Data Isolation
1. Switch to "Personal"
2. Add 3 transactions
3. Add 1 budget
4. Switch to "Work"
5. Verify no transactions or budgets visible (empty state)
6. Add different transactions in "Work"
7. Switch back to "Personal"
8. Verify Personal transactions still there, Work transactions not visible

### Test Scenario 3: Edit Context
1. Create a context named "Test"
2. Click edit icon
3. Change name to "Testing Updated"
4. Change type from Home to Work
5. Save changes
6. Verify name and type updated in selector
7. Verify you're still on the same context (data intact)

### Test Scenario 4: Delete Context
1. Create 3 contexts
2. Switch to second context
3. Delete first context
4. Verify it's removed from list
5. Verify you're still on second context
6. Try to delete all contexts until only 1 remains
7. Verify delete button is disabled on last context

### Test Scenario 5: Delete Active Context
1. Have 3 contexts
2. Switch to middle context (make it active)
3. Delete the active context
4. Verify app automatically switches to another context
5. Verify no errors or crashes

---

## Toast Notifications

Context operations show toast notifications:

| Action | Toast Message |
|--------|---------------|
| Create | "Context 'Name' created successfully" (green) |
| Switch | "Switched to Name" (green) |
| Edit | "Context 'Name' updated successfully" (green) |
| Delete | "Context 'Name' deleted successfully" (green) |
| Error | Specific error message (red) |

---

## Best Practices

### Organization Tips
- **Personal**: Home expenses, personal savings, personal investments
- **Work**: Work-related expenses, business travel, professional development
- **Business**: Business income/expenses, business savings, business investments

### Naming Conventions
- Keep names short and descriptive
- Use clear differentiators ("Client A", "Client B" vs "Project 1", "Project 2")
- Consider using emoji in names (not currently supported but can be added)

### When to Create New Contexts
- Starting a side business
- Freelance work (one per client)
- Shared finances (roommates, business partners)
- Different currencies or countries
- Tax-separated accounts

### When NOT to Create New Contexts
- Different bank accounts → Use account field in transactions
- Different categories → Use category field
- Different time periods → Use date filters (future feature)

---

## Technical Details

### Data Structure
```typescript
interface Context {
  id: number;
  name: string;
  type: 'Home' | 'Work' | 'Business';
  created_at: string;
}
```

### Storage
- Contexts stored in Supabase `contexts` table
- Current context ID stored in `localStorage` (persists across sessions)
- All financial data references `context_id` foreign key

### Automatic Switching
- On app load, last active context is restored from localStorage
- If that context no longer exists, first available context is used
- If no contexts exist, welcome screen appears

---

## Troubleshooting

### Issue: Can't delete context
**Cause:** It's your last remaining context  
**Solution:** Create another context first, then delete

### Issue: Deleted context but data still appears
**Cause:** Data is tied to context_id, not deleted when context is removed  
**Solution:** This is intentional - data is preserved for recovery

### Issue: Context name doesn't update after edit
**Cause:** May need to refresh  
**Solution:** Close and reopen context selector modal

### Issue: Lost access to data after deleting context
**Cause:** Context was deleted but data still exists in database  
**Solution:** 
1. Check database for context_id of missing data
2. Create new context manually or query database directly
3. Future feature: Data recovery tool

---

## Keyboard Shortcuts (Future)

Planned shortcuts:
- `Ctrl+K` → Open context selector
- `Ctrl+1-9` → Switch to context 1-9
- `Ctrl+N` → Create new context

---

## API Reference

### Context Actions
```typescript
// Load all contexts
await contextActions.loadContexts();

// Create context
const newContext = await contextActions.createContext('Name', 'Home');

// Update context
await contextActions.updateContext(id, 'New Name', 'Work');

// Delete context
await contextActions.deleteContext(id);

// Switch context
contextActions.switchContext(context);
```

---

Ready to manage your contexts? Open the app and try it out! 🎯
