<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: contacts, refresh } = await useFetch('/api/contacts')
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
            {{ contact.phone ? formatPhone(contact.phone) : contact.email }}
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
          <span class="indicator" :class="{ active: contact.hotdog }" title="Hotdog">🌭</span>
          <span class="indicator" :class="{ active: contact.taco }" title="Taco">🌮</span>
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
