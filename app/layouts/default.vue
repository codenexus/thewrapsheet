<script setup lang="ts">
import { authClient } from '../lib/auth-client'
const router = useRouter()
const menuOpen = ref(false)
const { data: me } = await useFetch('/api/auth/me', { server: false })
const { data: contacts } = await useFetch('/api/contacts', { server: false })

const reviewCount = useReviewCount()

async function signOut() {
  await authClient.signOut()
  router.push('/login')
}
function closeMenu() {
  menuOpen.value = false
}
</script>
<template>
  <div class="app-shell">
    <header class="topnav">
      <div class="topnav-inner">
        <NuxtLink to="/" class="wordmark" @click="closeMenu">
          🌯 The Wrap Sheet
        </NuxtLink>
        <!-- Desktop nav -->
        <nav class="nav-links desktop-nav">
          <NuxtLink to="/" class="nav-link">Contacts</NuxtLink>
          <NuxtLink to="/review" class="nav-link">
            Review Queue
            <ClientOnly>
              <span v-if="reviewCount > 0" class="review-badge">{{ reviewCount }}</span>
            </ClientOnly>
          </NuxtLink>
          <NuxtLink to="/settings" class="nav-link">Settings</NuxtLink>
          <NuxtLink v-if="me?.isAdmin" to="/admin" class="nav-link">Admin</NuxtLink>
        </nav>
        <button class="btn btn-ghost signout-btn desktop-nav" @click="signOut">
          Sign out
        </button>
        <!-- Mobile hamburger -->
        <button class="hamburger mobile-nav" @click="menuOpen = !menuOpen">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <!-- Mobile menu -->
      <div v-if="menuOpen" class="mobile-menu">
        <NuxtLink to="/" class="mobile-link" @click="closeMenu">Contacts</NuxtLink>
        <NuxtLink to="/review" class="nav-link">
          Review Queue
          <ClientOnly>
            <span v-if="reviewCount > 0" class="review-badge">{{ reviewCount }}</span>
          </ClientOnly>
        </NuxtLink>
        <NuxtLink to="/settings" class="mobile-link" @click="closeMenu">Settings</NuxtLink>
        <NuxtLink v-if="me?.isAdmin" to="/admin" class="mobile-link" @click="closeMenu">Admin</NuxtLink>
        <button class="mobile-link signout-mobile" @click="signOut">Sign out</button>
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
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  margin-left: auto;
}
.hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
  transition: all 0.15s;
}
.mobile-menu {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  padding: 0.5rem 0;
}
.mobile-link {
  display: block;
  padding: 0.85rem 1.5rem;
  color: var(--text-muted);
  font-weight: 500;
  font-size: 1rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  transition: all 0.15s;
  font-family: var(--font-body);
}
.mobile-link:hover,
.mobile-link.router-link-active {
  color: var(--text);
  background: var(--bg-elevated);
}
.signout-mobile {
  color: var(--red) !important;
  margin-top: 0.25rem;
  border-top: 1px solid var(--border);
}
.review-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--red);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 999px;
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 0.3rem;
  margin-left: 0.4rem;
  vertical-align: middle;
}
@media (max-width: 640px) {
  .desktop-nav {
    display: none;
  }
  .hamburger {
    display: flex;
  }
  .topnav-inner {
    gap: 1rem;
  }
}
</style>