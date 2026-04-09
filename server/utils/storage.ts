import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export const storage = supabase.storage

export async function uploadPhoto(userId: string, contactId: string, file: Buffer, mimeType: string, ext: string) {
  const path = `${userId}/${contactId}/${Date.now()}.${ext}`
  const { error } = await storage.from('photos').upload(path, file, {
    contentType: mimeType,
    upsert: false,
  })
  if (error) throw error
  return path
}

export async function getSignedUrl(path: string, expiresIn = 3600) {
  const { data, error } = await storage.from('photos').createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}

export async function deletePhoto(path: string) {
  await storage.from('photos').remove([path])
}
