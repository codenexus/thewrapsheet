import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface ParsedContact {
  intent: 'create' | 'update' | 'ambiguous'
  confidence: 'high' | 'low'
  reviewReason?: string
  firstName?: string
  lastName?: string
  alias?: string
  phone?: string
  email?: string
  hotdog?: boolean
  taco?: boolean
  notes?: string
  socialHandles?: { platform: string; handle: string }[]
}

export async function parseEmailToContact(
  body: string,
  subject: string
): Promise<ParsedContact> {
  const prompt = `You are parsing an email to extract contact information for a personal contact management app.

The app tracks these fields:
- firstName (required)
- lastName (optional)
- alias/nickname (optional)
- phone (optional)
- email (optional)
- hotdog: boolean - did the user give this person a hotdog? (sexual euphemism, interpret liberally)
- taco: boolean - did the user receive a taco from this person? (sexual euphemism, interpret liberally)
- notes: freeform text
- socialHandles: array of { platform, handle }

Determine the intent:
- "create": adding a new contact
- "update": updating an existing contact (look for words like "update", "add to", "change")
- "ambiguous": unclear

If intent is ambiguous, use the subject line as a hint. Subject: "${subject}"

Return ONLY a JSON object with no markdown, no explanation:
{
  "intent": "create" | "update" | "ambiguous",
  "confidence": "high" | "low",
  "reviewReason": "string or null",
  "firstName": "string or null",
  "lastName": "string or null",
  "alias": "string or null",
  "phone": "string or null",
  "email": "string or null",
  "hotdog": true | false | null,
  "taco": true | false | null,
  "notes": "string or null",
  "socialHandles": [] or [{ "platform": "string", "handle": "string" }]
}

Email body to parse:
${body}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content
    .filter(b => b.type === 'text')
    .map(b => (b as { type: 'text'; text: string }).text)
    .join('')

  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as ParsedContact
}