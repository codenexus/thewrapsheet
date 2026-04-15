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

definePageMeta({ layout: false })
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">🌯</div>
      <h1 class="login-title">The Wrap Sheet</h1>
      <p class="login-sub">Your personal black book</p>

      <div v-if="error" class="error-box">{{ error }}</div>

      <div class="login-form">
        <div class="field">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            @keyup.enter="signIn"
          />
        </div>
        <div class="field">
          <label>Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            @keyup.enter="signIn"
          />
        </div>
        <button class="login-btn" :disabled="loading" @click="signIn">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </div>

      <div class="login-footer">
        🌭 &nbsp; Keep it between us
      </div>
    </div>

    <div class="bg-text">THE WRAP SHEET</div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  position: relative;
  overflow: hidden;
}

.bg-text {
  position: absolute;
  font-family: var(--font-display);
  font-size: clamp(4rem, 15vw, 14rem);
  color: rgba(255, 255, 255, 0.02);
  letter-spacing: 0.05em;
  white-space: nowrap;
  user-select: none;
  pointer-events: none;
  bottom: -2rem;
  left: 50%;
  transform: translateX(-50%);
}

.login-card {
  position: relative;
  z-index: 1;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 0 60px rgba(234, 179, 8, 0.06);
}

.login-logo {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 0 12px rgba(234, 179, 8, 0.4));
}

.login-title {
  font-family: var(--font-display);
  font-size: 2.25rem;
  color: var(--yellow);
  text-align: center;
  letter-spacing: 0.02em;
  margin-bottom: 0.25rem;
}

.login-sub {
  text-align: center;
  color: var(--text-dim);
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

.error-box {
  background: var(--red-dim);
  border: 1px solid var(--red);
  color: #fca5a5;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field input {
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  padding: 0.75rem 1rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}

.field input:focus {
  border-color: var(--yellow);
}

.login-btn {
  margin-top: 0.5rem;
  background: var(--red);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.85rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.02em;
}

.login-btn:hover:not(:disabled) {
  background: var(--red-hover);
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 1.75rem;
  font-size: 0.8rem;
  color: var(--text-dim);
  font-style: italic;
}
</style>