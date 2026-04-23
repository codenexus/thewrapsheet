import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface UserFlag {
  id: string
  emoji: string
  label: string
}

export interface ParsedContact {
  intent: 'create' | 'update' | 'ambiguous'
  confidence: 'high' | 'low'
  reviewReason?: string
  firstName?: string
  lastName?: string
  alias?: string
  phone?: string
  email?: string
  notes?: string
  matchedFlagLabels?: string[]
  socialHandles?: { platform: string; handle: string }[]
}

export async function parseEmailToContact(
  body: string,
  subject: string,
  userFlags: UserFlag[] = []
): Promise<ParsedContact> {
  const flagsSection = userFlags.length
    ? `The user tracks these custom flags for contacts:
${userFlags.map(f => `- "${f.label}" (${f.emoji})`).join('\n')}

If the email content suggests any of these flags apply to this contact, include the matching label(s) in "matchedFlagLabels". Only include flags that are clearly indicated by the email content.`
    : 'The user has no custom flags configured.'

  const prompt = `You are parsing an email to extract contact information for a personal contact management app.

The app tracks these fields:
- firstName (required)
- lastName (optional)
- alias/nickname (optional)
- phone (optional)
- email (optional)
- notes: freeform text
- socialHandles: array of { platform, handle }

${flagsSection}

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
  "notes": "string or null",
  "matchedFlagLabels": [] or ["label1", "label2"],
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