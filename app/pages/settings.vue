<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: flags, refresh } = await useFetch('/api/flags')

const newEmoji = ref('')
const newLabel = ref('')
const adding = ref(false)
const error = ref('')

async function addFlag() {
  if (!newEmoji.value || !newLabel.value) return
  adding.value = true
  try {
    await $fetch('/api/flags', {
      method: 'POST',
      body: { emoji: newEmoji.value, label: newLabel.value },
    })
    newEmoji.value = ''
    newLabel.value = ''
    refresh()
  } catch (e: any) {
    error.value = e.message
  } finally {
    adding.value = false
  }
}

async function deleteFlag(id: string) {
  if (!confirm('Delete this flag? It will be removed from all contacts.')) return
  await $fetch(`/api/flags/${id}`, { method: 'DELETE' })
  refresh()
}

async function updateFlag(id: string, emoji: string, label: string) {
  await $fetch(`/api/flags/${id}`, {
    method: 'PATCH',
    body: { emoji, label },
  })
  refresh()
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
    </div>

    <div class="settings-section">
      <h2 class="section-title">My Flags</h2>
      <p class="section-desc">Define what you want to track for your contacts. These flags appear on every contact card.</p>

      <div class="flags-list">
        <div v-for="flag in flags" :key="flag.id" class="flag-row">
          <input
            class="flag-emoji-input"
            :value="flag.emoji"
            @change="updateFlag(flag.id, ($event.target as HTMLInputElement).value, flag.label)"
            maxlength="2"
          />
          <input
            class="flag-label-input"
            :value="flag.label"
            @change="updateFlag(flag.id, flag.emoji, ($event.target as HTMLInputElement).value)"
            placeholder="Label"
          />
          <button class="btn btn-ghost danger" @click="deleteFlag(flag.id)">✕</button>
        </div>
      </div>

      <div class="add-flag-row">
        <input
          v-model="newEmoji"
          class="flag-emoji-input"
          placeholder="🎯"
          maxlength="2"
        />
        <input
          v-model="newLabel"
          class="flag-label-input"
          placeholder="Flag label"
          @keyup.enter="addFlag"
        />
        <button class="btn btn-primary" :disabled="adding || !newEmoji || !newLabel" @click="addFlag">
          + Add
        </button>
      </div>
      <div v-if="error" class="error-msg">{{ error }}</div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: var(--yellow);
}

.settings-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  max-width: 600px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--yellow);
  margin-bottom: 0.4rem;
}

.section-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.flags-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.flag-row, .add-flag-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.flag-emoji-input {
  width: 60px;
  text-align: center;
  font-size: 1.25rem;
  padding: 0.5rem;
  flex-shrink: 0;
}

.flag-label-input {
  flex: 1;
}

.danger { color: var(--red) !important; }

.error-msg {
  font-size: 0.875rem;
  color: #fca5a5;
  margin-top: 0.5rem;
}
</style>