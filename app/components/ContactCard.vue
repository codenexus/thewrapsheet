<script setup lang="ts">
const router = useRouter()

const props = defineProps<{
  contact: {
    id: string
    firstName: string
    lastName?: string | null
    alias?: string | null
    phone?: string | null
    email?: string | null
    birthday?: string | null
    mainPhotoUrl?: string | null
    needsReview?: boolean
    socialHandles?: { id: string; platform: string; handle: string }[]
    contactFlags?: { id: string; flag: { id: string; emoji: string; label: string; sortOrder: number } }[]
  }
}>()

function navigate() {
  router.push(`/contacts/${props.contact.id}`)
}

function calculateAge(birthday: string | null) {
  if (!birthday) return null
  const today = new Date()
  const birth = new Date(birthday + 'T00:00:00')
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}
</script>

<template>
  <div class="contact-card" @click="navigate">
    <div class="contact-left">
      <div class="contact-avatar">
        <img v-if="contact.mainPhotoUrl" :src="contact.mainPhotoUrl" :alt="contact.firstName" />
        <span v-else class="avatar-initials">
          {{ contact.firstName[0] }}{{ contact.lastName?.[0] ?? '' }}
        </span>
      </div>
      <div v-if="contact.phone" class="avatar-actions">
        <a :href="`tel:${contact.phone}`" class="avatar-action" title="Call" @click.stop>📞</a>
        <a :href="`sms:${contact.phone}`" class="avatar-action" title="Text" @click.stop>💬</a>
      </div>
    </div>

    <div class="contact-info">
      <div class="contact-name">
        {{ contact.firstName }}{{ contact.lastName ? ` ${contact.lastName}` : '' }}
        <span v-if="contact.alias" class="contact-alias">"{{ contact.alias }}"</span>
      </div>
      <div v-if="contact.birthday" class="contact-age">
        {{ calculateAge(contact.birthday) }} years old
      </div>
      <div v-if="contact.socialHandles?.length" class="contact-socials">
        <span
          v-for="handle in contact.socialHandles.slice(0, 4)"
          :key="handle.id"
          class="social-icon"
          :title="handle.platform"
          @click.stop
        >
          <template v-if="usePlatformIcon(handle.platform).type === 'icon'">
            <img :src="usePlatformIcon(handle.platform).url" :alt="handle.platform" class="platform-icon" />
          </template>
          <template v-else>
            <span class="platform-abbr">{{ usePlatformIcon(handle.platform).abbr }}</span>
          </template>
        </span>
      </div>
    </div>

    <div class="contact-indicators">
      <span
        v-for="flag in [...(contact.contactFlags ?? [])].sort((a, b) => a.flag.sortOrder - b.flag.sortOrder).slice(0, 12)"
        :key="flag.id"
        class="indicator active"
        :title="flag.flag.label"
      >{{ flag.flag.emoji }}</span>
      <span v-if="contact.needsReview" class="indicator active" title="Needs Review">⚠️</span>
    </div>
  </div>
</template>

<style scoped>
.contact-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  transition: all 0.15s;
  cursor: pointer;
}

.contact-card:hover {
  border-color: var(--border-light);
  background: var(--bg-elevated);
  transform: translateY(-1px);
}

.contact-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.contact-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-elevated);
  border: 2px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--yellow);
}

.avatar-actions {
  display: flex;
  gap: 0.3rem;
  margin-top: 0.25rem;
}

.avatar-action {
  font-size: 0.85rem;
  text-decoration: none;
  opacity: 0.6;
  transition: opacity 0.15s;
  line-height: 1;
}

.avatar-action:hover {
  opacity: 1;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-name {
  font-weight: 600;
  color: var(--text);
  font-size: 1rem;
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.contact-alias {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
}

.contact-age {
  font-size: 0.82rem;
  color: var(--text-dim);
  margin-top: 0.15rem;
}

.contact-socials {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.35rem;
  flex-wrap: wrap;
  align-items: center;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
}

.platform-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  opacity: 0.7;
}

.platform-abbr {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.1rem 0.25rem;
  line-height: 1.4;
}

.contact-indicators {
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  grid-auto-flow: column;
  gap: 0.15rem;
  align-items: start;
  flex-shrink: 0;
  width: 72px;
}

.indicator {
  font-size: 1rem;
  opacity: 0.2;
  filter: grayscale(1);
  transition: all 0.15s;
  text-align: center;
  line-height: 1.4;
}

.indicator.active {
  opacity: 1;
  filter: none;
}
</style>