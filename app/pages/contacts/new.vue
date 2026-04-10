<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()
const loading = ref(false)
const error = ref('')

async function handleSubmit(data: Record<string, any>) {
  loading.value = true
  error.value = ''
  try {
    const { socialHandles, selectedFlagIds, ...contactData } = data
    const contact = await $fetch<{ id: string }>('/api/contacts', {
      method: 'POST',
      body: contactData,
    })

    // Save social handles
    if (socialHandles?.length) {
      await Promise.all(
        socialHandles.map((h: { platform: string; handle: string }) =>
          $fetch(`/api/contacts/${contact.id}/handles`, {
            method: 'POST',
            body: h,
          })
        )
      )
    }

    // Save flags
    if (selectedFlagIds?.length) {
      await Promise.all(
        selectedFlagIds.map((flagId: string) =>
          $fetch(`/api/contacts/${contact.id}/flags`, {
            method: 'POST',
            body: { flagId },
          })
        )
      )
    }

    router.push(`/contacts/${contact.id}`)
  } catch (e: any) {
    error.value = e.message ?? 'Failed to save contact'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <NuxtLink to="/" class="btn btn-ghost">← Back</NuxtLink>
      <h1 class="page-title">New Contact</h1>
    </div>
    <div v-if="error" class="error-banner">{{ error }}</div>
    <ContactForm :loading="loading" @submit="handleSubmit" />
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
  font-size: 2rem;
  color: var(--yellow);
}
.error-banner {
  background: var(--red-dim);
  border: 1px solid var(--red);
  color: #fca5a5;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}
</style>
