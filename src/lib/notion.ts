import { Client } from '@notionhq/client';

// Initialize Notion client
export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Example: Query a database
export async function queryDatabase(databaseId: string) {
  try {
    // Clean the database ID - remove any whitespace and ensure proper format
    const cleanId = databaseId.trim().replace(/\s/g, '');

    const apiKey = process.env.NOTION_API_KEY;
    if (!apiKey) {
      throw new Error('NOTION_API_KEY is not set');
    }

    // Direct fetch to avoid client bundling issues
    const res = await fetch(`https://api.notion.com/v1/databases/${cleanId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Notion query failed (${res.status}): ${text}`);
    }

    const json = await res.json();
    return json.results;
  } catch (error) {
    console.error('Error querying Notion database:', error);
    throw error;
  }
}

// Example: Get a page
export async function getPage(pageId: string) {
  try {
    const response = await notion.pages.retrieve({ page_id: pageId });
    return response;
  } catch (error) {
    console.error('Error retrieving Notion page:', error);
    throw error;
  }
}

// Example: Create a page in a database
export async function createPage(databaseId: string, properties: any) {
  try {
    // Clean the database ID - remove any whitespace
    const cleanId = databaseId.trim().replace(/\s/g, '');
    
    const response = await notion.pages.create({
      parent: {
        database_id: cleanId,
      },
      properties: properties,
    });
    return response;
  } catch (error) {
    console.error('Error creating Notion page:', error);
    throw error;
  }
}

// Example: Update a page
export async function updatePage(pageId: string, properties: any) {
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      properties: properties,
    });
    return response;
  } catch (error) {
    console.error('Error updating Notion page:', error);
    throw error;
  }
}

// Helper function to extract text from Notion rich text
export function extractText(richText: any[]): string {
  return richText.map((text) => text.plain_text).join('');
}

// Helper function to format Notion properties for form submission
export function formatPropertiesForSubmission(
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    experienceLevel: string;
    preferredCohort: string;
  },
  preferredCohortRelation?: { id: string }[]
) {
  return {
    'Name': {
      title: [
        {
          text: {
            content: `${formData.firstName} ${formData.lastName}`,
          },
        },
      ],
    },
    'Email': {
      email: formData.email,
    },
    'Phone': {
      phone_number: formData.phone,
    },
    'Country': {
      rich_text: [
        {
          text: {
            content: formData.country,
          },
        },
      ],
    },
    'City': {
      rich_text: [
        {
          text: {
            content: formData.city || '',
          },
        },
      ],
    },
    'Experience Level': {
      select: {
        name: formData.experienceLevel,
      },
    },
    // If the Notion property is a relation, supply relation; otherwise fallback to rich text
    'Preferred Cohort': preferredCohortRelation
      ? {
          relation: preferredCohortRelation,
        }
      : {
          rich_text: [
            {
              text: {
                content: formData.preferredCohort,
              },
            },
          ],
        },
  };
}

