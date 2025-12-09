# Step-by-Step Guide: Create Notion Database for Student Registration

## Quick Setup Guide

### Step 1: Create a New Database in Notion

1. Open Notion (web or desktop app)
2. Go to the page where you want to create the database
3. Type `/table` or `/database` and select "Table - Inline" or "Full page database"
4. Name it: **"Student Registration"** (or any name you prefer)

### Step 2: Set Up the Database Properties

Your database needs these **exact** property names and types:

#### 1. **Name** (Title)
- This is automatically created as the first column
- Type: **Title**
- This will store: "First Name Last Name"

#### 2. **Email**
- Click the "+" button to add a new property
- Name: **Email** (exact spelling, capital E)
- Type: **Email**
- This will store the student's email address

#### 3. **Phone**
- Click the "+" button to add a new property
- Name: **Phone** (exact spelling, capital P)
- Type: **Phone number**
- This will store the phone number with country code

#### 4. **Country**
- Click the "+" button to add a new property
- Name: **Country** (exact spelling, capital C)
- Type: **Text** or **Rich text**
- This will store the country name

#### 5. **City**
- Click the "+" button to add a new property
- Name: **City** (exact spelling, capital C)
- Type: **Text** or **Rich text**
- This will store the city name

#### 6. **Experience Level**
- Click the "+" button to add a new property
- Name: **Experience Level** (exact spelling with space, capital E and L)
- Type: **Select**
- Add these options:
  - `Beginner`
  - `Intermediate`
  - `Advanced`
- This will store the student's experience level

#### 7. **Preferred Cohort**
- Click the "+" button to add a new property
- Name: **Preferred Cohort** (exact spelling with space, capital P and C)
- Type: **Text** or **Rich text**
- This will store the cohort name (e.g., "Cohort 1 - January 2025")

### Step 3: Verify Property Names

**IMPORTANT:** Property names are case-sensitive and must match exactly:

✅ **Correct:**
- Name
- Email
- Phone
- Country
- City
- Experience Level
- Preferred Cohort

❌ **Wrong:**
- name (lowercase)
- E-mail (with hyphen)
- Phone Number (two words)
- country (lowercase)
- ExperienceLevel (no space)
- preferred cohort (lowercase)

### Step 4: Share Database with Integration

1. Click the "..." menu (three dots) in the top right of your database
2. Select **"Connections"** or **"Add connections"**
3. Find and select your integration (the one you created at https://www.notion.so/my-integrations)
4. Click **"Connect"**

### Step 5: Get the Database ID

1. Open your database in a web browser
2. Look at the URL - it will look like:
   ```
   https://www.notion.so/workspace/2c3f667519a1b2c3d4e5f67890abcdef?v=...
   ```
3. Copy the **32-character ID** (the part between the last `/` and the `?`)
   - Example: `2c3f667519a1b2c3d4e5f67890abcdef`
4. Add it to your `.env.local` file:
   ```env
   NOTION_APPLICATIONS_DB_ID=2c3f667519a1b2c3d4e5f67890abcdef
   ```

### Step 6: Test the Connection

1. Restart your dev server: `npm run dev`
2. Visit: `http://localhost:3000/api/notion/test`
3. You should see a success message!

### Visual Guide

Your database should look like this:

| Name | Email | Phone | Country | City | Experience Level | Preferred Cohort |
|------|-------|-------|---------|------|------------------|------------------|
| (Title) | (Email) | (Phone) | (Text) | (Text) | (Select) | (Text) |

### Troubleshooting

**If you get "Invalid request URL" error:**
- Make sure the database ID is exactly 32 characters
- Remove any spaces or extra characters
- Don't include the full URL, just the ID

**If you get "object_not_found" error:**
- The database is not shared with your integration
- Go back to Step 4 and share it again

**If form submission fails:**
- Check that property names match exactly (case-sensitive!)
- Verify the property types are correct
- Make sure the database is shared with the integration

### Optional: Create Cohorts Database

If you want to fetch cohorts from Notion, create another database with:

- **Name** (Title)
- **Start Date** (Date)
- **End Date** (Date)
- **Seats** (Number)
- **Available** (Number)
- **Level** (Select)
- **Duration** (Text)

Then add `NOTION_COHORTS_DB_ID` to your `.env.local` file.

---

**Need help?** Check `NOTION_TROUBLESHOOTING.md` for more detailed error solutions.


