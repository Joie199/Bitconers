# Sats Rewards System - Complete Structure & Features Overview

## 🏗️ System Architecture

### Database Structure

**Table: `sats_rewards`**

```
┌─────────────────────────────────────────────────────────────┐
│                    sats_rewards Table                      │
├─────────────────────────────────────────────────────────────┤
│ Core Fields:                                                │
│  • id (UUID) - Primary key                                 │
│  • student_id (UUID) → profiles(id) - Links to student     │
│  • amount_paid (INTEGER) - Sats already paid                │
│  • amount_pending (INTEGER) - Sats waiting to be paid       │
│  • reason (TEXT) - Human-readable description              │
│  • created_at, updated_at - Timestamps                      │
│                                                             │
│ Option 1 - Tracking Fields:                                 │
│  • status - 'pending' | 'processing' | 'paid' | 'failed'   │
│  • payment_date - When sats were actually paid              │
│  • awarded_by (UUID) → profiles(id) - Admin who awarded    │
│  • reward_type - 'assignment' | 'chapter' | 'discussion'   │
│              | 'peer_help' | 'project' | 'attendance'     │
│              | 'other'                                      │
│                                                             │
│ Option 3 - Entity Linking:                                  │
│  • related_entity_type - Type of entity                    │
│  • related_entity_id (UUID) - ID of related entity          │
└─────────────────────────────────────────────────────────────┘
```

### Automatic Registration

**Trigger: `trigger_create_sats_rewards_on_student`**
- **When**: After INSERT on `students` table
- **Action**: Automatically creates initial `sats_rewards` record with:
  - `student_id` = new student's profile_id
  - `amount_paid` = 0
  - `amount_pending` = 0
  - `status` = 'pending'
  - `reward_type` = 'other'
- **Purpose**: Ensures every student has a sats_rewards record from day one

---

## 🔄 Data Flow

### Current Flow (Student View)

```
1. Student logs in
   ↓
2. Dashboard loads → StudentDashboard component
   ↓
3. fetchSatsTotals() called
   ↓
4. GET /api/sats?email=student@email.com
   OR
   GET /api/sats?studentId=profile-uuid
   ↓
5. API queries sats_rewards WHERE student_id = profile.id
   ↓
6. Sums all amount_paid → totalPaid
   Sums all amount_pending → totalPending
   ↓
7. Returns { totalPaid, totalPending }
   ↓
8. Displayed in Sats Wallet:
   - Total Earned: totalPaid sats
   - Pending Rewards: totalPending sats
```

### Alternative Flow (via user-data API)

```
1. Dashboard page loads with userData
   ↓
2. user-data API calculates sats totals
   ↓
3. Returns satsPaid and satsPending in student object
   ↓
4. Dashboard uses userData.student.satsPaid directly
   (No separate API call needed)
```

---

## 📍 Where Sats Are Displayed

### 1. **Student Dashboard - Sats Wallet Card**
- **Location**: Overview tab → Right side card
- **Shows**:
  - Total Earned (large, bold, orange)
  - Pending Rewards (smaller, yellow)
  - Withdraw button (disabled until Lightning integration)
- **Data Source**: `/api/sats?email=...` or `userData.student.satsPaid`

### 2. **Student Dashboard - Progress Overview**
- **Location**: Overview tab → Progress Overview card
- **Shows**: "Sats Earned" metric (smaller display)
- **Data Source**: Same as Sats Wallet

### 3. **Student Dashboard - Certification Section**
- **Location**: Certification tab
- **Shows**: 
  - Requirement: "Earn at least 500 sats"
  - Current: `satsEarned` sats
  - Status: ✓ (green) if >= 500, ✗ (red) if < 500
- **Data Source**: Same as Sats Wallet

### 4. **Student Dashboard - Leaderboard**
- **Location**: Leaderboard tab
- **Shows**: Student rankings by total sats earned
- **Data Source**: `/api/leaderboard` (all students, sorted by sats)

---

## 🔌 API Endpoints

### 1. `/api/sats` (GET)
**Purpose**: Get student's total sats (paid + pending)

**Query Parameters**:
- `email` (optional) - Student email
- `studentId` (optional) - Student profile UUID

**Response**:
```json
{
  "totalPaid": 1500,
  "totalPending": 500
}
```

**Logic**:
1. Gets profile ID from email or uses studentId directly
2. Queries `sats_rewards` WHERE `student_id` = profile.id
3. Sums `amount_paid` → totalPaid
4. Sums `amount_pending` → totalPending

### 2. `/api/leaderboard` (GET)
**Purpose**: Get all students ranked by sats

**Response**:
```json
{
  "leaderboard": [
    {
      "studentId": "uuid",
      "name": "Student Name",
      "sats": 5000,
      "rank": 1
    },
    ...
  ]
}
```

**Logic**:
1. Fetches all sats_rewards with profile names
2. Groups by student_id
3. Sums amount_paid per student
4. Sorts descending by sats
5. Adds rank numbers

### 3. `/api/profile/user-data` (POST)
**Purpose**: Comprehensive user data including sats

**Request Body**:
```json
{
  "email": "student@email.com"
}
```

**Response** (includes):
```json
{
  "student": {
    "satsPaid": 1500,
    "satsPending": 500,
    ...
  }
}
```

---

## 🎯 Current Features

### ✅ Implemented

1. **Database Structure**
   - Complete `sats_rewards` table with all tracking fields
   - Automatic registration trigger for new students
   - Indexes for performance

2. **API Endpoints**
   - `/api/sats` - Student-specific sats totals
   - `/api/leaderboard` - Rankings by sats
   - `/api/profile/user-data` - Includes sats in user data

3. **Dashboard Display**
   - Sats Wallet card showing earned + pending
   - Progress Overview showing sats earned
   - Certification requirement tracking (500 sats)
   - Leaderboard showing rankings

4. **Data Filtering**
   - Properly filters by student (not showing all students' sats)
   - Supports both email and UUID lookup
   - Handles missing data gracefully (returns 0)

---

## 🚀 Future Features (Not Yet Implemented)

### 1. Admin Interface to Award Sats
**Needed APIs**:
- `POST /api/admin/sats/award` - Award sats to one student
- `POST /api/admin/sats/bulk-award` - Award sats to multiple students
- `GET /api/admin/sats/history` - View reward history

**Example Request**:
```json
{
  "studentId": "uuid",
  "amount": 500,
  "reason": "Completed Assignment 1",
  "rewardType": "assignment",
  "relatedEntityType": "assignment",
  "relatedEntityId": "assignment-uuid"
}
```

### 2. Automatic Rewards
**Triggers**:
- When chapter marked complete → Award sats
- When assignment submitted → Award sats
- When student attends live session → Award sats
- When student helps peer → Award sats

**Implementation**: Add logic to existing completion/attendance APIs

### 3. Lightning Network Integration
**Features**:
- Generate Lightning invoices for pending sats
- Track payment status
- Update `amount_pending` → `amount_paid` when paid
- Update `status` → 'paid' and set `payment_date`
- Enable withdrawal button functionality

### 4. Reward History View
**Display**:
- List of all rewards for a student
- Show: amount, reason, date, status, type
- Filter by reward_type, status, date range
- Link to related entity (assignment, chapter, etc.)

---

## 📊 Data Relationships

```
profiles (id)
    ↓
students (profile_id) ← Trigger creates sats_rewards
    ↓
sats_rewards (student_id)
    ├── Multiple records per student (one per reward)
    ├── Each record tracks: amount_paid, amount_pending
    ├── Links to: awarded_by (admin profile)
    └── Links to: related_entity (assignment/chapter/event)
```

**Key Points**:
- One student can have **multiple** sats_rewards records
- Each record represents one reward event
- Totals are calculated by **summing** all records
- Records can be linked to specific entities (assignments, chapters, etc.)

---

## 💡 Usage Examples

### Example 1: Award Sats for Assignment Completion
```sql
INSERT INTO sats_rewards (
  student_id,
  amount_pending,
  reason,
  status,
  reward_type,
  related_entity_type,
  related_entity_id,
  awarded_by
) VALUES (
  'student-profile-uuid',
  500,
  'Completed Assignment 1: Bitcoin Basics',
  'pending',
  'assignment',
  'assignment',
  'assignment-uuid',
  'admin-profile-uuid'
);
```

### Example 2: Award Sats for Chapter Completion
```sql
INSERT INTO sats_rewards (
  student_id,
  amount_pending,
  reason,
  status,
  reward_type,
  related_entity_type,
  related_entity_id,
  awarded_by
) VALUES (
  'student-profile-uuid',
  200,
  'Completed Chapter 5: Lightning Network',
  'pending',
  'chapter',
  'chapter',
  'chapter-5-uuid',
  'admin-profile-uuid'
);
```

### Example 3: Mark Sats as Paid (After Lightning Payment)
```sql
UPDATE sats_rewards
SET 
  amount_paid = amount_pending,
  amount_pending = 0,
  status = 'paid',
  payment_date = NOW()
WHERE id = 'reward-uuid';
```

---

## 🔍 Query Patterns

### Get Student's Total Sats
```sql
SELECT 
  SUM(amount_paid) as total_paid,
  SUM(amount_pending) as total_pending
FROM sats_rewards
WHERE student_id = 'profile-uuid';
```

### Get Student's Reward History
```sql
SELECT *
FROM sats_rewards
WHERE student_id = 'profile-uuid'
ORDER BY created_at DESC;
```

### Get Rewards by Type
```sql
SELECT *
FROM sats_rewards
WHERE student_id = 'profile-uuid'
  AND reward_type = 'assignment'
ORDER BY created_at DESC;
```

### Get Pending Rewards Only
```sql
SELECT *
FROM sats_rewards
WHERE student_id = 'profile-uuid'
  AND status = 'pending'
  AND amount_pending > 0;
```

---

## 🎨 UI Components

### Sats Wallet Card
- **Location**: Dashboard Overview tab
- **Shows**: Total Earned + Pending Rewards
- **Styling**: Orange theme, gradient buttons
- **Actions**: Withdraw button (disabled until LN integration)

### Progress Overview
- **Location**: Dashboard Overview tab
- **Shows**: Sats Earned metric (smaller display)
- **Styling**: Yellow/orange theme

### Certification Progress
- **Location**: Dashboard Certification tab
- **Shows**: Requirement status with checkmarks
- **Styling**: Green checkmarks, red crosses

### Leaderboard
- **Location**: Dashboard Leaderboard tab
- **Shows**: Table with student rankings
- **Styling**: Rank-based colors (gold, silver, bronze)

---

## 🔐 Security & Access

### Current Implementation
- Uses `supabaseAdmin` for API access (bypasses RLS)
- Filters by student ID/email (prevents cross-student access)
- Returns zeros if student not found (safe fallback)

### Future Considerations
- Add authentication checks to admin APIs
- Verify admin permissions before awarding sats
- Add rate limiting to prevent abuse
- Log all sats award actions for audit trail

---

## 📈 Performance Optimizations

### Indexes Created
1. `idx_sats_rewards_student_status` - Fast queries by student + status
2. `idx_sats_rewards_type` - Fast filtering by reward type
3. `idx_sats_rewards_created` - Fast sorting by date
4. `idx_sats_rewards_related_entity` - Fast entity lookups
5. `idx_sats_rewards_awarded_by` - Fast admin audit queries

### Query Optimization
- Uses indexed columns for filtering
- Sums calculated in database (efficient)
- Single query per student (not multiple)

---

## 🎯 Summary

**Current State**:
- ✅ Database structure complete
- ✅ Automatic student registration
- ✅ Student-specific sats display
- ✅ Multiple display locations
- ✅ API endpoints functional

**Next Steps**:
- ⏳ Admin interface to award sats
- ⏳ Automatic reward triggers
- ⏳ Lightning Network integration
- ⏳ Reward history view
- ⏳ Withdrawal functionality

The system is **ready for awarding sats** - you just need to create the admin APIs and UI to insert records into the `sats_rewards` table!
