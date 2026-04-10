<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const loading = ref(false)
const error = ref('')

const { data: contact } = await useFetch(`/api/contacts/${id}`)

if (!contact.value) {
  throw createError({ statusCode: 404, message: 'Contact not found' })
}

async function handleSubmit(data: Record<string, any>) {
  loading.value = true
  error.value = ''
  try {
    const { socialHandles, selectedFlagIds, ...contactData } = data

    await $fetch(`/api/contacts/${id}`, {
      method: 'PATCH',
      body: contactData,
    })

    // Delete existing handles then re-add
    if (contact.value?.socialHandles?.length) {
      await Promise.all(
        contact.value.socialHandles.map((h: { id: string }) =>
          $fetch(`/api/contacts/${id}/handles/${h.id}`, { method: 'DELETE' })
        )
      )
    }

    if (socialHandles?.length) {
      await Promise.all(
        socialHandles.map((h: { platform: string; handle: string }) =>
          $fetch(`/api/contacts/${id}/handles`, {
            method: 'POST',
            body: h,
          })
        )
      )
    }

    // Delete existing flags then re-add
    if (contact.value?.contactFlags?.length) {
      await Promise.all(
        contact.value.contactFlags.map((cf: { flagId: string }) =>
          $fetch(`/api/contacts/${id}/flags/${cf.flagId}`, { method: 'DELETE' })
        )
      )
    }

    if (selectedFlagIds?.length) {
      await Promise.all(
        selectedFlagIds.map((flagId: string) =>
          $fetch(`/api/contacts/${id}/flags`, {
            method: 'POST',
            body: { flagId },
          })
        )
      )
    }

    router.push(`/contacts/${id}`)
  } catch (e: any) {
    console.error('Submit error:', e)
    error.value = e.message ?? 'Failed to update contact'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <NuxtLink :to="`/contacts/${id}`" class="btn btn-ghost">← Back</NuxtLink>
      <h1 class="page-title">Edit Contact</h1>
    </div>
    <div v-if="error" class="error-banner">{{ error }}</div>
    <ContactForm :initial="contact" :contact-id="id" :loading="loading" @submit="handleSubmit" />
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
