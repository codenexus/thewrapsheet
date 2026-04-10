import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL!, { prepare: false })

// Get all users
const users = await client`SELECT id FROM "user"`

for (const u of users) {
  // Create default flags for each user
  const [hotdogFlag] = await client`
    INSERT INTO user_flags (id, user_id, emoji, label, sort_order, created_at)
    VALUES (gen_random_uuid(), ${u.id}, '🌭', 'Hotdog', 0, NOW())
    RETURNING id
  `
  const [tacoFlag] = await client`
    INSERT INTO user_flags (id, user_id, emoji, label, sort_order, created_at)
    VALUES (gen_random_uuid(), ${u.id}, '🌮', 'Taco', 1, NOW())
    RETURNING id
  `

  // Migrate existing contact data
  const userContacts = await client`
    SELECT id, hotdog, taco FROM contacts WHERE user_id = ${u.id}
  `

  for (const contact of userContacts) {
    if (contact.hotdog) {
      await client`
        INSERT INTO contact_flags (id, contact_id, flag_id, created_at)
        VALUES (gen_random_uuid(), ${contact.id}, ${hotdogFlag.id}, NOW())
      `
    }
    if (contact.taco) {
      await client`
        INSERT INTO contact_flags (id, contact_id, flag_id, created_at)
        VALUES (gen_random_uuid(), ${contact.id}, ${tacoFlag.id}, NOW())
      `
    }
  }

  console.log(`✓ Migrated user ${u.id} — created hotdog flag ${hotdogFlag.id}, taco flag ${tacoFlag.id}`)
}

console.log('Migration complete')
await client.end()