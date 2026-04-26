<script setup lang="ts">
import Fuse from 'fuse.js'

definePageMeta({ layout: 'default' })

const { data: contacts, refresh } = await useFetch('/api/contacts')
const { data: birthdays } = await useFetch('/api/contacts/birthdays', { server: false })
const filter = ref<'active' | 'archived'>('active')
const search = ref('')
const currentLetter = ref('')
const letterVisible = ref(false)
const contactsContainer = ref<HTMLElement | null>(null)
let fadeTimer: ReturnType<typeof setTimeout> | null = null

const filtered = computed(() => {
  let result = contacts.value?.filter(c => c.status === filter.value) ?? []
  if (!search.value.trim()) return result

  const fuse = new Fuse(result, {
    keys: ['firstName', 'lastName', 'alias', 'phone', 'email'],
    threshold: 0.3,
  })

  return fuse.search(search.value).map(r => r.item)
})

const groupedContacts = computed(() => {
  if (search.value.trim()) return null
  const groups: Record<string, typeof filtered.value> = {}
  for (const contact of filtered.value) {
    const letter = contact.firstName?.[0]?.toUpperCase() ?? '#'
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(contact)
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
})

const reviewCount = useReviewCount()
watchEffect(() => {
  reviewCount.value = contacts.value?.filter(c => c.needsReview).length ?? 0
})

function onScroll() {
  if (!contactsContainer.value) return
  const headers = contactsContainer.value.querySelectorAll('.letter-header')
  let current = ''
  for (const header of headers) {
    const rect = header.getBoundingClientRect()
    if (rect.top <= window.innerHeight / 2) {
      current = header.textContent?.trim() ?? ''
    }
  }
  currentLetter.value = current
  letterVisible.value = true

  if (fadeTimer) clearTimeout(fadeTimer)
  fadeTimer = setTimeout(() => {
    letterVisible.value = false
  }, 1500)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (fadeTimer) clearTimeout(fadeTimer)
})

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

    <div class="search-bar">
      <input
        v-model="search"
        type="search"
        placeholder="Search contacts..."
        class="search-input"
      />
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

    <div v-else ref="contactsContainer" class="contacts-wrapper">
      <div v-if="currentLetter && !search" class="floating-letter" :class="{ visible: letterVisible }">
        {{ currentLetter }}
      </div>

      <div v-if="search" class="contact-grid">
        <ContactCard v-for="contact in filtered" :key="contact.id" :contact="contact" />
      </div>

      <div v-else>
        <div v-for="[letter, group] in groupedContacts" :key="letter" class="letter-group">
          <div class="letter-header">{{ letter }}</div>
          <div class="contact-grid">
            <ContactCard v-for="contact in group" :key="contact.id" :contact="contact" />
          </div>
        </div>
      </div>
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

.search-bar {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  max-width: 400px;
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  padding: 0.65rem 1rem;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.15s;
}

.search-input:focus {
  border-color: var(--yellow);
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

.contacts-wrapper {
  position: relative;
}

.floating-letter {
  position: fixed;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-display);
  font-size: 3rem;
  color: var(--yellow);
  opacity: 0;
  pointer-events: none;
  z-index: 50;
  line-height: 1;
  user-select: none;
  display: none;
  transition: opacity 0.5s ease;
}

.floating-letter.visible {
  opacity: 0.15;
}

@media (max-width: 640px) {
  .floating-letter {
    display: block;
  }
}

.letter-group {
  margin-bottom: 1.5rem;
}

.letter-header {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--yellow);
  padding: 0.4rem 0;
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
</style>