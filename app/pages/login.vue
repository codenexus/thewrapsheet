<script setup lang="ts">
import { authClient } from '../lib/auth-client'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function signIn() {
  error.value = ''
  loading.value = true
  const { error: err } = await authClient.signIn.email({
    email: email.value,
    password: password.value,
    callbackURL: '/',
  })
  if (err) error.value = err.message ?? 'Sign in failed'
  loading.value = false
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>The Wrap Sheet</h1>
      <p class="subtitle">Sign in to continue</p>
      <div v-if="error" class="error">{{ error }}</div>
      <div class="form">
        <input v-model="email" type="email" placeholder="Email" autocomplete="email" />
        <input v-model="password" type="password" placeholder="Password" autocomplete="current-password" />
        <button :disabled="loading" @click="signIn">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f0f0f;
}
.login-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 380px;
}
h1 { color: #fff; margin: 0 0 0.25rem; font-size: 1.5rem; }
.subtitle { color: #888; margin: 0 0 1.5rem; font-size: 0.9rem; }
.error {
  background: #2a1515;
  border: 1px solid #5a2020;
  color: #ff6b6b;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}
.form { display: flex; flex-direction: column; gap: 0.75rem; }
input {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #fff;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}
input:focus { border-color: #555; }
button {
  background: #fff;
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
