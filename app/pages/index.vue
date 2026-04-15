<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: contacts, refresh } = await useFetch('/api/contacts')
const { data: birthdays } = await useFetch('/api/contacts/birthdays')
const filter = ref<'active' | 'archived'>('active')

const filtered = computed(() =>
  contacts.value?.filter(c => c.status === filter.value) ?? []
)

function formatPhone(phone: string | null) {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

function calculateAge(birthday: string | null) {
  if (!birthday) return null
  const today = new Date()
  const birth = new Date(birthday + 'T00:00:00')
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

watch(filter, () => refresh())
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">The Black Book</h1>
        <p class="page-subtitle">{{ filtered.length }} {{ filter }} contact{{ filtered.length !== 1 ? 's' : '' }}</p>
      </div>
      <div class="header-actions">
        <div class="filter-tabs">
          <button
            class="filter-tab"
            :class="{ active: filter === 'active' }"
            @click="filter = 'active'"
          >Active</button>
          <button
            class="filter-tab"
            :class="{ active: filter === 'archived' }"
            @click="filter = 'archived'"
          >Archived</button>
        </div>
        <NuxtLink to="/contacts/new" class="btn btn-primary">
          + Add Contact
        </NuxtLink>
      </div>
    </div>

    <div v-if="birthdays?.length" class="birthday-section">
      <h2 class="birthday-title">🎂 Upcoming Birthdays</h2>
      <div class="birthday-list">
        <NuxtLink
          v-for="b in birthdays"
          :key="b.id"
          :to="`/contacts/${b.id}`"
          class="birthday-card"
          :class="{ today: b.isToday }"
        >
          <div class="birthday-name">
            {{ b.firstName }}{{ b.lastName ? ` ${b.lastName}` : '' }}
          </div>
          <div class="birthday-meta">
            <span class="birthday-age">Turning {{ b.turningAge }}</span>
            <span class="birthday-days">
              {{ b.isToday ? '🎉 Today!' : `in ${b.daysUntil} day${b.daysUntil !== 1 ? 's' : ''}` }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>

    <div v-if="filtered.length === 0" class="empty-state">
      <p class="empty-emoji">📋</p>
      <p class="empty-title">No contacts yet</p>
      <p class="empty-sub">Add your first entry to the black book</p>
      <NuxtLink to="/contacts/new" class="btn btn-primary" style="margin-top:1rem">
        + Add Contact
      </NuxtLink>
    </div>

    <div v-else class="contact-grid">
      <NuxtLink
        v-for="contact in filtered"
        :key="contact.id"
        :to="`/contacts/${contact.id}`"
        class="contact-card"
      >
        <div class="contact-avatar">
          <img v-if="contact.mainPhotoUrl" :src="contact.mainPhotoUrl" :alt="contact.firstName" />
          <span v-else class="avatar-initials">
            {{ contact.firstName[0] }}{{ contact.lastName?.[0] ?? '' }}
          </span>
        </div>
        <div class="contact-info">
          <div class="contact-name">
            {{ contact.firstName }}{{ contact.lastName ? ` ${contact.lastName}` : '' }}
            <span v-if="contact.alias" class="contact-alias">"{{ contact.alias }}"</span>
          </div>
          <div v-if="contact.phone || contact.email" class="contact-detail">
            <span v-if="contact.phone">{{ formatPhone(contact.phone) }}</span>
            <span v-else-if="contact.email">{{ contact.email }}</span>
          </div>
          <div v-if="contact.birthday" class="contact-age">
            {{ calculateAge(contact.birthday) }} years old
          </div>
          <div v-if="contact.socialHandles?.length" class="contact-socials">
            <span
              v-for="handle in contact.socialHandles.slice(0, 2)"
              :key="handle.id"
              class="social-pill"
            >{{ handle.platform }}</span>
          </div>
        </div>
        <div class="contact-indicators">
          <span
            v-for="flag in [...(contact.contactFlags ?? [])].sort((a, b) => a.flag.sortOrder - b.flag.sortOrder)"
            :key="flag.id"
            class="indicator active"
            :title="flag.flag.label"
          >{{ flag.flag.emoji }}</span>
          <span v-if="contact.needsReview" class="indicator active review" title="Needs Review">⚠️</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: var(--yellow);
  line-height: 1;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-tabs {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 3px;
  gap: 3px;
}

.filter-tab {
  padding: 0.35rem 0.9rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.15s;
}

.filter-tab.active {
  background: var(--bg-elevated);
  color: var(--text);
}

.birthday-section {
  margin-bottom: 2rem;
}

.birthday-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--yellow);
  margin-bottom: 0.75rem;
}

.birthday-list {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.birthday-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  min-width: 160px;
  transition: all 0.15s;
}

.birthday-card:hover {
  border-color: var(--border-light);
  background: var(--bg-elevated);
}

.birthday-card.today {
  border-color: var(--yellow);
  background: var(--yellow-dim);
}

.birthday-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text);
}

.birthday-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.birthday-age {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.birthday-days {
  font-size: 0.75rem;
  color: var(--yellow);
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  color: var(--text-muted);
}

.empty-emoji { font-size: 3rem; margin-bottom: 1rem; }
.empty-title { font-size: 1.25rem; color: var(--text); font-weight: 500; }
.empty-sub { font-size: 0.9rem; margin-top: 0.5rem; }

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  transition: all 0.15s;
  cursor: pointer;
}

.contact-card:hover {
  border-color: var(--border-light);
  background: var(--bg-elevated);
  transform: translateY(-1px);
}

.contact-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-elevated);
  border: 2px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--yellow);
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-name {
  font-weight: 600;
  color: var(--text);
  font-size: 1rem;
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.contact-alias {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
}

.contact-detail {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-age {
  font-size: 0.82rem;
  color: var(--text-dim);
  margin-top: 0.15rem;
}

.contact-socials {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.35rem;
  flex-wrap: wrap;
}

.social-pill {
  font-size: 0.7rem;
  padding: 0.1rem 0.5rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text-muted);
}

.contact-indicators {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  align-items: center;
  flex-shrink: 0;
}

.indicator {
  font-size: 1.1rem;
  opacity: 0.2;
  filter: grayscale(1);
  transition: all 0.15s;
}

.indicator.active {
  opacity: 1;
  filter: none;
}
</style>