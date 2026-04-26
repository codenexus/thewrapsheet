<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: flags, refresh } = await useFetch('/api/flags')
const { data: me, refresh: refreshMe } = await useFetch('/api/auth/me', { server: false })

// Flags
const newEmoji = ref('')
const newLabel = ref('')
const adding = ref(false)
const flagError = ref('')

async function addFlag() {
  if (!newEmoji.value || !newLabel.value) return
  if ((flags.value?.length ?? 0) >= 12) {
    flagError.value = 'Maximum of 12 flags allowed'
    return
  }
  adding.value = true
  flagError.value = ''
  try {
    await $fetch('/api/flags', {
      method: 'POST',
      body: { emoji: newEmoji.value, label: newLabel.value },
    })
    newEmoji.value = ''
    newLabel.value = ''
    refresh()
  } catch (e: any) {
    flagError.value = e.message
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

// Account
const accountForm = reactive({
  name: '',
  email: '',
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const accountSaving = ref(false)
const accountError = ref('')
const accountSuccess = ref(false)
const passwordSaving = ref(false)
const passwordError = ref('')
const passwordSuccess = ref(false)

watch(me, (val) => {
  if (val) {
    accountForm.name = val.name ?? ''
    accountForm.email = val.email ?? ''
  }
}, { immediate: true })

async function saveAccount() {
  accountSaving.value = true
  accountError.value = ''
  try {
    await $fetch('/api/account/update', {
      method: 'PATCH',
      body: { name: accountForm.name, email: accountForm.email },
    })
    accountSuccess.value = true
    setTimeout(() => accountSuccess.value = false, 3000)
    refreshMe()
  } catch (e: any) {
    accountError.value = e.data?.message ?? 'Failed to save'
  } finally {
    accountSaving.value = false
  }
}

async function changePassword() {
  passwordError.value = ''
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Passwords do not match'
    return
  }
  passwordSaving.value = true
  try {
    await $fetch('/api/account/password', {
      method: 'POST',
      body: {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      },
    })
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordSuccess.value = true
    setTimeout(() => passwordSuccess.value = false, 3000)
  } catch (e: any) {
    passwordError.value = e.data?.message ?? 'Failed to change password'
  } finally {
    passwordSaving.value = false
  }
}

const copied = ref(false)

async function copyFeedUrl() {
  await navigator.clipboard.writeText(`webcal://thewrapsheet.app/api/calendar/feed?token=${me.value?.inboundAlias}`)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
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
        <button class="btn btn-primary" :disabled="adding || !newEmoji || !newLabel || (flags?.length ?? 0) >= 12" @click="addFlag">
          + Add
        </button>
        <span class="flag-count">{{ flags?.length ?? 0 }} / 12</span>
      </div>
      <div v-if="flagError" class="error-msg">{{ flagError }}</div>
    </div>

    <div class="settings-section">
      <h2 class="section-title">Calendar Feed</h2>
      <p class="section-desc">Subscribe to this URL in your phone's calendar app to see all your dates automatically.</p>

      <div v-if="me?.inboundAlias" class="calendar-feed-row">
        <code class="feed-url">webcal://thewrapsheet.app/api/calendar/feed?token={{ me.inboundAlias }}</code>
        <button class="btn btn-secondary" @click="copyFeedUrl">{{ copied ? '✓ Copied' : 'Copy' }}</button>
      </div>
      <div v-else class="error-msg">No inbound alias set — contact your admin.</div>
    </div>

    <div class="settings-section">
      <h2 class="section-title">Account</h2>
      <p class="section-desc">Update your name and email address.</p>
      <div v-if="accountError" class="error-msg">{{ accountError }}</div>
      <div class="account-grid">
        <div class="form-group">
          <label>Name</label>
          <input v-model="accountForm.name" placeholder="Your name" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="accountForm.email" type="email" placeholder="your@email.com" />
          <p class="field-warning">⚠️ Make sure this is correct — you'll need it to log in next time.</p>
        </div>
      </div>
      <div class="section-actions">
        <button class="btn btn-primary" :disabled="accountSaving" @click="saveAccount">
          {{ accountSaving ? 'Saving...' : 'Save Changes' }}
        </button>
        <span v-if="accountSuccess" class="success-inline">✓ Saved</span>
      </div>
    </div>

    <div class="settings-section">
      <h2 class="section-title">Change Password</h2>
      <p class="section-desc">Update your password.</p>
      <div v-if="passwordError" class="error-msg">{{ passwordError }}</div>
      <div class="form-group">
        <label>Current Password</label>
        <input v-model="passwordForm.currentPassword" type="password" placeholder="Current password" />
      </div>
      <div class="account-grid" style="margin-top: 1rem">
        <div class="form-group">
          <label>New Password</label>
          <input v-model="passwordForm.newPassword" type="password" placeholder="New password" />
        </div>
        <div class="form-group">
          <label>Confirm New Password</label>
          <input v-model="passwordForm.confirmPassword" type="password" placeholder="Confirm new password" />
        </div>
      </div>
      <div class="section-actions">
        <button class="btn btn-primary" :disabled="passwordSaving" @click="changePassword">
          {{ passwordSaving ? 'Saving...' : 'Change Password' }}
        </button>
        <span v-if="passwordSuccess" class="success-inline">✓ Password changed</span>
      </div>
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
  margin-bottom: 1.5rem;
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

.form-group label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.4rem;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.success-inline {
  font-size: 0.875rem;
  color: var(--yellow);
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
  margin-bottom: 0.75rem;
}

.field-warning {
  font-size: 0.75rem;
  color: var(--text-dim);
  margin-top: 0.35rem;
}

.account-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.flag-count {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.calendar-feed-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.feed-url {
  flex: 1;
  font-size: 0.8rem;
  color: var(--text-muted);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  word-break: break-all;
  min-width: 0;
}

@media (max-width: 640px) {
  .account-grid { grid-template-columns: 1fr; }
}
</style>