<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: contacts, refresh } = await useFetch('/api/contacts', {
  server: false,
  lazy: true,
})

const reviewQueue = computed(() =>
  contacts.value?.filter(c => c.needsReview) ?? []
)

const reviewCount = useReviewCount()

async function approve(id: string) {
  await ($fetch as any)(`/api/contacts/${id}`, {
    method: 'PATCH',
    body: { needsReview: false, reviewReason: undefined },
  })
  reviewCount.value = Math.max(0, reviewCount.value - 1)
  await refreshNuxtData('/api/contacts')
  refresh()
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">Review Queue</h1>
      <span class="badge badge-yellow">{{ reviewQueue.length }} pending</span>
    </div>

    <div v-if="reviewQueue.length === 0" class="empty-state">
      <p class="empty-emoji">✅</p>
      <p class="empty-title">All clear!</p>
      <p class="empty-sub">No contacts waiting for review</p>
    </div>

    <div v-else class="review-list">
      <div v-for="contact in reviewQueue" :key="contact.id" class="review-card">
        <div class="review-info">
          <div class="review-name">
            {{ contact.firstName }}{{ contact.lastName ? ` ${contact.lastName}` : '' }}
          </div>
          <div class="review-details">
            <span v-if="contact.phone">📞 {{ contact.phone }}</span>
            <span v-if="contact.email">✉️ {{ contact.email }}</span>
            <template v-if="contact.contactFlags?.length">
              <span v-for="cf in contact.contactFlags" :key="cf.flag.id">
                {{ cf.flag.emoji }} {{ cf.flag.label }}
              </span>
            </template>
          </div>
          <div v-if="contact.reviewReason" class="review-reason">
            ⚠️ {{ contact.reviewReason }}
          </div>
          <div v-if="contact.notes" class="review-notes">{{ contact.notes }}</div>
        </div>
        <div class="review-actions">
          <NuxtLink :to="`/contacts/${contact.id}/edit`" class="btn btn-secondary">Edit</NuxtLink>
          <button class="btn btn-primary" @click="approve(contact.id)">Approve</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}
.page-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: var(--yellow);
}
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  color: var(--text-muted);
}
.empty-emoji { font-size: 3rem; margin-bottom: 1rem; }
.empty-title { font-size: 1.25rem; color: var(--text); font-weight: 500; }
.empty-sub { font-size: 0.9rem; margin-top: 0.5rem; }

.review-list { display: flex; flex-direction: column; gap: 1rem; }

.review-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--yellow);
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem;
  flex-wrap: wrap;
}

.review-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.4rem;
}

.review-details {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.review-reason {
  margin-top: 0.4rem;
  font-size: 0.875rem;
  color: var(--amber, #f59e0b);
  font-weight: 500;
}

.review-notes {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  font-style: italic;
}

.review-actions { display: flex; gap: 0.75rem; flex-shrink: 0; }
</style>