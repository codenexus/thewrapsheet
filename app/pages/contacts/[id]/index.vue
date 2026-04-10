<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const { data: contact, refresh } = await useFetch(`/api/contacts/${id}`)

const signedPhotoUrl = ref<string | null>(null)

onMounted(async () => {
  if (contact.value?.mainPhotoUrl) {
    try {
      const { signedUrl } = await $fetch<{ signedUrl: string }>('/api/photos/signed-url', {
        params: { path: contact.value.mainPhotoUrl },
      })
      signedPhotoUrl.value = signedUrl
    } catch {}
  }
})

if (!contact.value) {
  throw createError({ statusCode: 404, message: 'Contact not found' })
}

async function archiveContact() {
  if (!confirm('Archive this contact?')) return
  await $fetch(`/api/contacts/${id}`, { method: 'PATCH', body: { status: 'archived' } })
  router.push('/')
}

async function deleteContactPermanently() {
  if (!confirm('Permanently delete this contact? This cannot be undone.')) return
  await $fetch(`/api/contacts/${id}`, { method: 'DELETE' })
  router.push('/')
}

async function clearReview() {
  await $fetch(`/api/contacts/${id}`, {
    method: 'PATCH',
    body: { needsReview: false },
  })
  refresh()
}

function formatPhone(phone: string | null) {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

function formatBirthday(birthday: string) {
  const date = new Date(birthday + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function calculateAge(birthday: string) {
  const today = new Date()
  const birth = new Date(birthday + 'T00:00:00')
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return `${age} years old`
}
</script>

<template>
  <div class="page" v-if="contact">
    <div class="detail-header">
      <NuxtLink to="/" class="btn btn-ghost back-btn">← Back</NuxtLink>
      <div class="detail-actions">
        <NuxtLink :to="`/contacts/${id}/edit`" class="btn btn-secondary">Edit</NuxtLink>
        <button class="btn btn-ghost" @click="archiveContact">Archive</button>
        <button class="btn btn-ghost danger" @click="deleteContactPermanently">Delete</button>
      </div>
    </div>

    <div v-if="contact.needsReview" class="review-banner">
      ⚠️ This contact was added via email and needs your review.
      <button class="btn btn-secondary btn-sm" @click="clearReview">Mark as reviewed</button>
    </div>

    <div class="detail-layout">
      <div class="detail-sidebar">
        <div class="avatar-large">
          <img v-if="signedPhotoUrl" :src="signedPhotoUrl" :alt="contact.firstName" />
          <span v-else class="avatar-initials-large">
            {{ contact.firstName[0] }}{{ contact.lastName?.[0] ?? '' }}
          </span>
        </div>

        <div class="indicators-large">
          <div
            v-for="flag in [...(contact.contactFlags ?? [])].sort((a, b) => a.flag.sortOrder - b.flag.sortOrder)"
            :key="flag.id"
            class="indicator-row active"
          >
            <span class="ind-emoji">{{ flag.flag.emoji }}</span>
            <span class="ind-label">{{ flag.flag.label }}</span>
          </div>
          <div v-if="!contact.contactFlags?.length" class="indicator-row">
            <span class="ind-label" style="color: var(--text-dim)">No flags set</span>
          </div>
        </div>

        <div class="sidebar-meta">
          <div class="meta-item">
            <span class="meta-label">Status</span>
            <span class="badge" :class="contact.status === 'active' ? 'badge-green' : 'badge-red'">
              {{ contact.status }}
            </span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Added</span>
            <span class="meta-value">{{ new Date(contact.createdAt).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>

      <div class="detail-main">
        <div class="name-block">
          <h1 class="detail-name">
            {{ contact.firstName }}{{ contact.lastName ? ` ${contact.lastName}` : '' }}
          </h1>
          <p v-if="contact.alias" class="detail-alias">"{{ contact.alias }}"</p>
        </div>

        <div class="info-section" v-if="contact.phone || contact.email">
          <h2 class="section-title">Contact Info</h2>
          <div class="info-grid">
            <div v-if="contact.phone" class="info-item">
              <span class="info-label">Phone</span>
              <span class="info-value">{{ formatPhone(contact.phone) }}</span>
            </div>
            <div v-if="contact.email" class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{ contact.email }}</span>
            </div>
          </div>
        </div>

        <div class="info-section" v-if="contact.birthday">
          <h2 class="section-title">Birthday</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Date</span>
              <span class="info-value">{{ formatBirthday(contact.birthday) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Age</span>
              <span class="info-value">{{ calculateAge(contact.birthday) }}</span>
            </div>
          </div>
        </div>

        <div class="info-section" v-if="contact.socialHandles?.length">
          <h2 class="section-title">Social</h2>
          <div class="info-grid">
            <div v-for="handle in contact.socialHandles" :key="handle.id" class="info-item">
              <span class="info-label">{{ handle.platform }}</span>
              <span class="info-value">{{ handle.handle }}</span>
            </div>
          </div>
        </div>

        <div class="info-section" v-if="contact.notes">
          <h2 class="section-title">Notes</h2>
          <div class="notes-block">{{ contact.notes }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.detail-actions { display: flex; gap: 0.75rem; }

.danger { color: var(--red) !important; }
.danger:hover { background: var(--red-dim) !important; }

.review-banner {
  background: var(--yellow-dim);
  border: 1px solid var(--yellow);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  color: var(--text);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-sm { padding: 0.3rem 0.75rem; font-size: 0.8rem; }

.detail-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 640px) {
  .detail-layout { grid-template-columns: 1fr; }
}

.detail-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }

.avatar-large {
  width: 160px;
  height: 160px;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg-elevated);
  border: 2px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-large img { width: 100%; height: 100%; object-fit: cover; }

.avatar-initials-large {
  font-family: var(--font-display);
  font-size: 3.5rem;
  color: var(--yellow);
}

.indicators-large {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.indicator-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  opacity: 0.4;
  filter: grayscale(0.8);
  transition: all 0.15s;
}

.indicator-row.active {
  opacity: 1;
  filter: none;
  border-color: var(--border-light);
}

.ind-emoji { font-size: 1.2rem; }
.ind-label { flex: 1; font-weight: 500; font-size: 0.9rem; }
.ind-status { font-size: 0.8rem; color: var(--text-muted); }

.sidebar-meta { display: flex; flex-direction: column; gap: 0.75rem; }

.meta-item { display: flex; flex-direction: column; gap: 0.25rem; }
.meta-label { font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }
.meta-value { font-size: 0.9rem; color: var(--text-muted); }

.name-block { margin-bottom: 2rem; }

.detail-name {
  font-family: var(--font-display);
  font-size: 2.75rem;
  color: var(--text);
  line-height: 1;
}

.detail-alias {
  font-size: 1rem;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 0.35rem;
}

.info-section { margin-bottom: 2rem; }

.section-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--yellow);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
  letter-spacing: 0.03em;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item { display: flex; flex-direction: column; gap: 0.2rem; }
.info-label { font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }
.info-value { color: var(--text); font-size: 0.95rem; }

.notes-block {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 1rem;
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.7;
  white-space: pre-wrap;
}
</style>