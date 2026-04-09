import { auth } from '../../utils/auth'
import { getContacts } from '../../services/contacts'
import { getSignedUrl } from '../../utils/storage'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const query = getQuery(event)
  const status = query.status as 'active' | 'archived' | undefined

  const contacts = await getContacts(session.user.id, status)

  // Generate signed URLs for any contacts with photos
  const contactsWithPhotos = await Promise.all(
    contacts.map(async (contact) => {
      if (contact.mainPhotoUrl) {
        try {
          const signedUrl = await getSignedUrl(contact.mainPhotoUrl)
          return { ...contact, mainPhotoUrl: signedUrl }
        } catch {
          return contact
        }
      }
      return contact
    })
  )

  return contactsWithPhotos
})
