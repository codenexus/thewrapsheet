<script setup lang="ts">
definePageMeta({ 
  layout: 'default',
  middleware: ['admin'],
})

const { data: users, refresh } = await useFetch('/api/admin/users')
const { data: me } = await useFetch('/api/auth/me', { server: false })

const showCreateForm = ref(false)
const creating = ref(false)
const createError = ref('')

const newUser = reactive({
  name: '',
  email: '',
  password: '',
  inboundAlias: '',
  isAdmin: false,
})

async function createUser() {
  creating.value = true
  createError.value = ''
  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: { ...newUser },
    })
    newUser.name = ''
    newUser.email = ''
    newUser.password = ''
    newUser.inboundAlias = ''
    newUser.isAdmin = false
    showCreateForm.value = false
    refresh()
  } catch (e: any) {
    createError.value = e.data?.message ?? 'Failed to create user'
  } finally {
    creating.value = false
  }
}

async function toggleAdmin(u: any) {
  if (u.id === me.value?.id) return
  await $fetch(`/api/admin/users/${u.id}`, {
    method: 'PATCH',
    body: { isAdmin: !u.isAdmin, inboundAlias: u.inboundAlias, name: u.name },
  })
  refresh()
}

const resetUserId = ref<string | null>(null)
const resetPassword = ref('')
const resetting = ref(false)
const resetSuccess = ref(false)

async function resetUserPassword(id: string) {
  resetting.value = true
  try {
    await $fetch(`/api/admin/users/${id}/reset-password`, {
      method: 'POST',
      body: { password: resetPassword.value },
    })
    resetUserId.value = null
    resetPassword.value = ''
    resetSuccess.value = true
    setTimeout(() => resetSuccess.value = false, 3000)
  } catch (e: any) {
    alert(e.data?.message ?? 'Failed to reset password')
  } finally {
    resetting.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Admin</h1>
        <p class="page-subtitle">{{ users?.length ?? 0 }} users</p>
      </div>
      <button class="btn btn-primary" @click="showCreateForm = !showCreateForm">
        + Add User
      </button>
    </div>

    <div v-if="showCreateForm" class="create-form">
      <h2 class="form-title">New User</h2>
      <div v-if="createError" class="error-box">{{ createError }}</div>
      <div class="form-grid">
        <div class="form-group">
          <label>Name</label>
          <input v-model="newUser.name" placeholder="Full name" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="newUser.email" type="email" placeholder="email@example.com" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input v-model="newUser.password" type="password" placeholder="Temporary password" />
        </div>
        <div class="form-group">
          <label>Inbound Email Alias</label>
          <input v-model="newUser.inboundAlias" placeholder="e.g. add-sarah" />
        </div>
      </div>
      <div class="form-group checkbox-group">
        <label>
          <input v-model="newUser.isAdmin" type="checkbox" />
          Admin
        </label>
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" @click="showCreateForm = false">Cancel</button>
        <button class="btn btn-primary" :disabled="creating" @click="createUser">
          {{ creating ? 'Creating...' : 'Create User' }}
        </button>
      </div>
    </div>

    <div class="users-list">
      <div v-for="u in users" :key="u.id" class="user-card">
        <div class="user-info">
          <div class="user-name">
            {{ u.name }}
            <span v-if="u.isAdmin" class="admin-badge">Admin</span>
          </div>
          <div class="user-email">{{ u.email }}</div>
          <div class="user-meta">
            <span class="user-alias">alias: {{ u.inboundAlias ?? 'not set' }}</span>
            <span class="user-since">joined {{ new Date(u.createdAt).toLocaleDateString() }}</span>
          </div>
        </div>
        <div class="user-actions">
          <button 
            class="btn btn-secondary btn-sm" 
            :disabled="u.id === me?.id"
            @click="toggleAdmin(u)"
          >
            {{ u.isAdmin ? 'Remove Admin' : 'Make Admin' }}
          </button>
          <button class="btn btn-secondary btn-sm" @click="resetUserId = u.id">
            Reset Password
          </button>
        </div>

        <div v-if="resetUserId === u.id" class="reset-form">
          <input v-model="resetPassword" type="password" placeholder="New password" class="reset-input" />
          <button class="btn btn-primary btn-sm" :disabled="resetting" @click="resetUserPassword(u.id)">
            {{ resetting ? 'Saving...' : 'Save' }}
          </button>
          <button class="btn btn-ghost btn-sm" @click="resetUserId = null">Cancel</button>
        </div>
      </div>
    </div>

    <div v-if="resetSuccess" class="success-toast">
      ✓ Password reset successfully
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

.create-form {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.form-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--yellow);
  margin-bottom: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
}

.error-box {
  background: var(--red-dim);
  border: 1px solid var(--red);
  color: #fca5a5;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.checkbox-group {
  margin-bottom: 1rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.user-info { flex: 1; min-width: 200px; }

.user-name {
  font-weight: 600;
  color: var(--text);
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.admin-badge {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  background: var(--yellow-dim);
  border: 1px solid var(--yellow);
  color: var(--yellow);
  border-radius: 999px;
  font-weight: 600;
}

.user-email {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
  word-break: break-all;
}

.user-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.35rem;
  flex-wrap: wrap;
}

.user-alias, .user-since {
  font-size: 0.75rem;
  color: var(--text-dim);
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-sm { padding: 0.3rem 0.75rem; font-size: 0.8rem; }

.reset-form {
  width: 100%;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.reset-input {
  flex: 1;
  min-width: 150px;
}

.success-toast {
  position: fixed;
  top: 5rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card);
  border: 1px solid var(--yellow);
  color: var(--yellow);
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  z-index: 200;
  white-space: nowrap;
}
</style>