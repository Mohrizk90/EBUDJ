# Browser Testing Checklist

Use this checklist while testing in your browser. Check off each item as you verify it works.

## Prerequisites
- [ ] Supabase database set up (tables created)
- [ ] RLS policies disabled (ran fix-rls-policies.sql)
- [ ] .env file configured with correct credentials
- [ ] Dev server running (npm run dev)
- [ ] Browser open at http://localhost:3000

---

## Test Session 1: First-Time User Experience

### Welcome & Context Setup
- [ ] See welcome screen (if no contexts exist)
- [ ] Click "Create Your First Context"
- [ ] Modal opens and first field is focused
- [ ] Enter name: "Personal"
- [ ] Select type: "Home"
- [ ] Click "Create Context" button
- [ ] See success toast notification
- [ ] Context appears in header badge

---

## Test Session 2: Dashboard

### Empty Dashboard
- [ ] Dashboard shows with zero values
- [ ] See empty state for transactions
- [ ] Click "Add Transaction" from empty state
- [ ] Redirects to transactions page

### With Data
- [ ] Add a few transactions (both income and expense)
- [ ] Return to dashboard
- [ ] Verify stat cards show correct totals:
  - [ ] Total Income (green icon)
  - [ ] Total Expenses (red icon)
  - [ ] Net Income (green/red based on value)
- [ ] See recent transactions list (max 5)
- [ ] Check spending by category progress bars
- [ ] See spending distribution chart (pie chart)
- [ ] Hover over chart sections → See tooltips
- [ ] Click Refresh button → Data reloads

---

## Test Session 3: Transactions

### Create Transaction
- [ ] Click "Add Transaction" button
- [ ] Modal opens with auto-focused first field
- [ ] Fill in:
  - [ ] Description: "Grocery shopping"
  - [ ] Date: Today's date
  - [ ] Amount: 125.50
  - [ ] Type: Expense
  - [ ] Category: Food & Dining
  - [ ] Account: Bank Account
  - [ ] Notes: (optional)
- [ ] Click "Create" button
- [ ] See success toast
- [ ] Transaction appears in list

### Create Income
- [ ] Add income transaction
- [ ] Verify green badge shows "Income"
- [ ] Check positive amount display

### Mobile View
- [ ] Resize browser to 375px width
- [ ] Table disappears
- [ ] Cards appear instead
- [ ] Each card shows:
  - [ ] Category icon (colored badge)
  - [ ] Description
  - [ ] Date
  - [ ] Amount (colored)
  - [ ] Type badge
  - [ ] Category and Account
  - [ ] Edit and Delete buttons

### Edit Transaction
- [ ] Click edit icon on a transaction
- [ ] Modal pre-fills with existing data
- [ ] Change amount
- [ ] Click "Update"
- [ ] See success toast
- [ ] Verify change in list

### Delete Transaction
- [ ] Click delete icon (trash)
- [ ] Confirmation dialog appears
- [ ] Read message
- [ ] Click "Cancel" → Nothing happens
- [ ] Click delete icon again
- [ ] Click "Delete" in dialog
- [ ] See success toast
- [ ] Transaction removed from list

### Keyboard
- [ ] Open create modal
- [ ] Press Escape → Modal closes
- [ ] Open modal again
- [ ] Tab through fields
- [ ] Submit with Enter key

---

## Test Session 4: Budgets

### Create Budget
- [ ] Click "Add Budget"
- [ ] Select category: "Food & Dining"
- [ ] Set limit: 500
- [ ] Set month: Current month
- [ ] Click "Create"
- [ ] See success toast
- [ ] Budget card appears with:
  - [ ] Category icon (colored badge)
  - [ ] Category name
  - [ ] Month
  - [ ] Progress bar (green, should be at 0%)
  - [ ] Spent amount
  - [ ] Remaining amount

### Test Progress
- [ ] Note the "Food & Dining" budget spent amount
- [ ] Go to Transactions
- [ ] Add expense for "Food & Dining"
- [ ] Return to Budgets
- [ ] Verify spent amount increased
- [ ] Check progress bar updated
- [ ] Add more expenses to reach 80% → Bar turns yellow
- [ ] Add more to exceed 100% → Bar turns red

### Edit & Delete
- [ ] Edit budget limit
- [ ] See update toast
- [ ] Delete budget
- [ ] Confirm in dialog
- [ ] See success toast

### Empty State
- [ ] Delete all budgets
- [ ] See empty state with icon
- [ ] Click "Create Budget" from empty state

---

## Test Session 5: Savings

### Create Savings Goal
- [ ] Click "Add Savings Goal"
- [ ] Enter:
  - [ ] Account: "Emergency Fund"
  - [ ] Current Amount: 1000
  - [ ] Goal: 5000
  - [ ] Date: Today
  - [ ] Description: "6 months expenses"
- [ ] Click "Create"
- [ ] See success toast
- [ ] Card shows:
  - [ ] Account name
  - [ ] Description
  - [ ] Progress bar (20%)
  - [ ] Amounts and remaining

### Update Progress
- [ ] Edit savings goal
- [ ] Increase current amount to 2500
- [ ] Progress bar updates to 50%
- [ ] Remaining amount shows 2500

### Multiple Goals
- [ ] Add another savings goal
- [ ] Verify both show on grid
- [ ] Check responsive layout

---

## Test Session 6: Investments

### Add Investment
- [ ] Click "Add Investment"
- [ ] Fill in:
  - [ ] Asset: "Apple Stock"
  - [ ] Type: Stock
  - [ ] Amount Invested: 1000
  - [ ] Current Value: 1200
  - [ ] Date: Past date
  - [ ] Notes: (optional)
- [ ] Click "Create"
- [ ] See success toast
- [ ] Table shows:
  - [ ] Asset name
  - [ ] Type
  - [ ] Invested amount
  - [ ] Current value
  - [ ] Return: +$200 (green)
  - [ ] Percentage: +20% (green)
  - [ ] Date

### Test Negative Return
- [ ] Add investment with current value < invested
- [ ] Verify return shows in red
- [ ] Check negative percentage

### CRUD Operations
- [ ] Edit current value
- [ ] Verify return recalculates
- [ ] Delete investment (with confirmation)

---

## Test Session 7: Subscriptions

### Add Subscription
- [ ] Click "Add Subscription"
- [ ] Enter:
  - [ ] Service: "Netflix"
  - [ ] Amount: 15.99
  - [ ] Frequency: Monthly
  - [ ] Next Billing: Next month
  - [ ] Status: Active
- [ ] Click "Create"
- [ ] See success toast
- [ ] Table shows:
  - [ ] Service name
  - [ ] Amount
  - [ ] Frequency
  - [ ] Yearly cost (calculated)
  - [ ] Next billing date
  - [ ] Status badge (green for Active)

### Test Different Frequencies
- [ ] Add yearly subscription (yearly cost = amount)
- [ ] Add weekly subscription (yearly cost = amount * 52)
- [ ] Verify calculations correct

### Status Changes
- [ ] Edit subscription
- [ ] Change status to "Paused"
- [ ] Badge changes to yellow
- [ ] Change to "Cancelled"
- [ ] Badge changes to red

---

## Test Session 8: Dark Mode

### Toggle Theme
- [ ] Click moon/sun icon in header
- [ ] Page switches to dark mode
- [ ] All elements have proper dark colors
- [ ] Refresh page → Dark mode persists
- [ ] Test on all pages:
  - [ ] Dashboard
  - [ ] Transactions
  - [ ] Budgets
  - [ ] Savings
  - [ ] Investments
  - [ ] Subscriptions
- [ ] Check modals in dark mode
- [ ] Verify chart colors work in dark
- [ ] Check empty states in dark
- [ ] Toggle back to light mode

---

## Test Session 9: Context Switching

### Create Multiple Contexts
- [ ] Create "Work" context (type: Work)
- [ ] Create "Business" context (type: Business)
- [ ] Click context selector in header
- [ ] See all 3 contexts listed

### Data Isolation
- [ ] Switch to "Personal"
- [ ] Add some transactions
- [ ] Switch to "Work"
- [ ] Verify no transactions show (empty)
- [ ] Add different transactions to "Work"
- [ ] Switch back to "Personal"
- [ ] Verify Personal transactions still there
- [ ] Work transactions not visible

---

## Test Session 10: Error Handling

### Network Errors
- [ ] Turn off WiFi / Disconnect internet
- [ ] Try to create transaction
- [ ] See error toast with message
- [ ] Reconnect
- [ ] Retry → Should work

### Validation Errors
- [ ] Try to create transaction with empty fields
- [ ] Browser shows validation messages
- [ ] Try to enter negative amount
- [ ] Try invalid date formats

---

## Test Session 11: Accessibility

### Keyboard Navigation
- [ ] Use Tab key to navigate
- [ ] See focus indicators on buttons
- [ ] Press Enter on buttons
- [ ] Navigate through form fields with Tab
- [ ] Use arrow keys in dropdowns
- [ ] Press Escape to close modals

### Screen Reader (Optional)
- [ ] Turn on screen reader
- [ ] Navigate through pages
- [ ] Verify ARIA labels are read
- [ ] Check button descriptions
- [ ] Test form labels

---

## Test Session 12: Responsive Design

### Mobile (375px)
- [ ] Resize browser to 375px
- [ ] Check all pages render correctly
- [ ] Headers stack vertically
- [ ] Buttons are full width or properly sized
- [ ] Transaction cards display well
- [ ] Modals fit on screen
- [ ] Nav items scroll horizontally

### Tablet (768px)
- [ ] Resize to 768px
- [ ] Stat cards in grid (2-3 columns)
- [ ] Tables start showing
- [ ] Budget cards in 2 columns
- [ ] Good spacing

### Desktop (1280px+)
- [ ] Full layout
- [ ] All tables visible
- [ ] 3-column stat grid
- [ ] 3-column budget grid
- [ ] Chart next to progress bars

---

## Bug Tracking

### Bugs Found
Document any issues:

1. [Bug #1]
   - Description:
   - Steps:
   - Expected:
   - Actual:
   - Priority: High/Medium/Low

---

## Sign-Off Checklist

After completing all tests:

- [ ] All features working correctly
- [ ] No critical bugs
- [ ] Mobile experience is good
- [ ] Dark mode works everywhere
- [ ] Toasts show for all actions
- [ ] Confirmations prevent accidents
- [ ] Forms are easy to use
- [ ] Empty states are helpful
- [ ] Charts display correctly
- [ ] Performance is acceptable

**Tested by**: _______________
**Date**: _______________
**Browser**: _______________
**Ready for Production**: [ ] Yes [ ] No

---

Happy testing! 🧪
