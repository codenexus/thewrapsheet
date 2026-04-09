import { auth } from '../../utils/auth'
import { uploadPhoto, getSignedUrl } from '../../utils/storage'
import { updateContact, getContact } from '../../services/contacts'
import sharp from 'sharp'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const formData = await readFormData(event)
  const file = formData.get('photo') as File
  const contactId = formData.get('contactId') as string

  if (!file || !contactId) {
    throw createError({ statusCode: 400, message: 'Missing photo or contactId' })
  }

  const contact = await getContact(session.user.id, contactId)
  if (!contact) throw createError({ statusCode: 404, message: 'Contact not found' })

  const buffer = Buffer.from(await file.arrayBuffer())

  // Convert any format to WebP
  const webpBuffer = await sharp(buffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()

  const path = await uploadPhoto(session.user.id, contactId, webpBuffer, 'image/webp', 'webp')

  await updateContact(session.user.id, contactId, { mainPhotoUrl: path })

  const signedUrl = await getSignedUrl(path)

  return { path, signedUrl }
})
