<script setup lang="ts">
import { authClient } from '../lib/auth-client'

const router = useRouter()

async function signOut() {
  await authClient.signOut()
  router.push('/login')
}
</script>

<template>
  <div class="app-shell">
    <header class="topnav">
      <div class="topnav-inner">
        <NuxtLink to="/" class="wordmark">
          🌮 The Wrap Sheet
        </NuxtLink>
        <nav class="nav-links">
          <NuxtLink to="/" class="nav-link">Contacts</NuxtLink>
          <NuxtLink to="/review" class="nav-link">Review Queue</NuxtLink>
          <NuxtLink to="/settings" class="nav-link">Settings</NuxtLink>
        </nav>
        <button class="btn btn-ghost signout-btn" @click="signOut">
          Sign out
        </button>
      </div>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.topnav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(26, 18, 8, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

.topnav-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.wordmark {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--yellow);
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.nav-link {
  padding: 0.4rem 0.9rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-weight: 500;
  transition: all 0.15s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--text);
  background: var(--bg-elevated);
}

.signout-btn {
  margin-left: auto;
  font-size: 0.875rem;
}
</style>
