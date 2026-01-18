# Project Specification: Offline Payment Admin Portal

## 1. Project Overview
**Context:** Our main application currently handles payments via Stripe. However, specific clients require **Offline Payments** (bank transfer, cash, check).
**Goal:** Create a dashboard that allows admins to manage Plans, Subscriptions, and manually reconcile/record offline payments for clients.

## 2. Technical Stack & Standards
* **Framework:** React (Vite) with TypeScript.
* **Styling:** Tailwind CSS.
* **UI Component Library:** Shadcn UI (Use the CLI to install components).
* **Form Management:** React Hook Form (integrating with Shadcn `Form` components).
* **Data Fetching:** React Query (TanStack Query) for state management and API caching.
* **Validation:** Zod (Recommended for use with React Hook Form schemas).

## 3. User Roles
* **Admin/Manager:** The only user type allowed to access this portal.

## 4. Feature Requirements

### 4.1. Authentication
* **Login Screen:**
    * Use `React Hook Form` for input handling.
    * Fields: Email, Password.
    * Action: Authenticate against the system (Mock API for now).
    * *Constraint:* No "Sign Up" or "Register" feature (this is an internal tool).
* **Logout:**
    * Button available in the global navigation/sidebar.
    * Action: Clear session/token and redirect to Login.

### 4.2. Dashboard / Overview
* Display a summary of:
    * Total Active Subscriptions.
    * Pending Offline Payments.
    * Recent Transactions.

### 4.3. Plan Management
* **View Plans:** List all available subscription plans (e.g., Basic, Pro, Enterprise).
* **Manage Plans:** Capability to Create, Update, or Archive plans.
* **Plan Attributes:** Name, Price, Currency, Billing Interval (Monthly/Yearly).

### 4.4. Subscription Management
* **List View:** Display a list of all client subscriptions using a Shadcn `Table`.
* **Filtering:**
    * Filter by Payment Type: `Online (Stripe)` vs `Offline`.
    * Filter by Status: `Active`, `Pending`, `Overdue`, `Cancelled`.
* **Client Search:** Search subscriptions by Client Name or Email.

### 4.5. Offline Payment Processing (Core Feature)
* **The Workflow:**
    1.  Admin selects a Client/Subscription marked as "Offline Payment".
    2.  Admin clicks "Mark as Paid".
    3.  **Modal (Dialog):** Use Shadcn `Dialog` component.
        * Input: Transaction Date (use Shadcn `Calendar`/`Popover`).
        * Input: Reference Number (e.g., Bank Transfer ID).
        * Input: Amount Paid.
        * Input: Notes (Optional).
    4.  **Action:** Use `useMutation` (React Query) to update the subscription status to `Active` and record the payment.

## 5. Data Entities (Rough Schema)

**Client**
- id, name, email

**Plan**
- id, name, price, currency, interval

**Subscription**
- id, client_id, plan_id, status (active/pending/overdue)
- payment_method (stripe/offline)

**PaymentRecord**
- id, subscription_id, amount, date, reference_code, type (online/offline)

## 6. UI/UX Guidelines
* Clean, professional Admin Dashboard aesthetic.
* Use a Sidebar for navigation (Dashboard, Plans, Subscriptions, Settings).
* Use Badges/Chips to color-code statuses (e.g., Green for Paid, Yellow for Pending, Red for Overdue).