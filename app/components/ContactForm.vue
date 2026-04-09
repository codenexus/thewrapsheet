<script setup lang="ts">
const props = defineProps<{
  initial?: Record<string, any>
  loading?: boolean
  contactId?: string
}>()

const emit = defineEmits<{
  submit: [data: Record<string, any>]
}>()

const form = reactive({
  firstName: props.initial?.firstName ?? '',
  lastName: props.initial?.lastName ?? '',
  alias: props.initial?.alias ?? '',
  phone: props.initial?.phone ?? '',
  email: props.initial?.email ?? '',
  hotdog: props.initial?.hotdog ?? false,
  taco: props.initial?.taco ?? false,
  status: props.initial?.status ?? 'active',
  notes: props.initial?.notes ?? '',
})

const socialHandles = ref<{ platform: string; handle: string }[]>(
  props.initial?.socialHandles?.map((h: any) => ({ platform: h.platform, handle: h.handle })) ?? []
)

function addHandle() {
  socialHandles.value.push({ platform: '', handle: '' })
}

function removeHandle(i: number) {
  socialHandles.value.splice(i, 1)
}

function handleSubmit() {
  emit('submit', {
    ...form,
    socialHandles: socialHandles.value.filter(h => h.platform && h.handle),
  })
}

function formatPhoneInput(e: Event) {
  const input = e.target as HTMLInputElement
  const digits = input.value.replace(/\D/g, '').slice(0, 10)
  let formatted = digits
  if (digits.length >= 7) {
    formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  } else if (digits.length >= 4) {
    formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  } else if (digits.length >= 1) {
    formatted = `(${digits}`
  }
  form.phone = formatted
}
</script>

<template>
  <form class="contact-form" @submit.prevent="handleSubmit">

    <div class="form-section" v-if="contactId">
      <h2 class="form-section-title">Photo</h2>
      <PhotoUpload :contact-id="contactId" :current-path="initial?.mainPhotoUrl" />
    </div>

    <div class="form-section">
      <h2 class="form-section-title">Identity</h2>
      <div class="form-row">
        <div class="form-group">
          <label>First Name *</label>
          <input v-model="form.firstName" required placeholder="First name" />
        </div>
        <div class="form-group">
          <label>Last Name</label>
          <input v-model="form.lastName" placeholder="Last name" />
        </div>
      </div>
      <div class="form-group">
        <label>Alias / Nickname</label>
        <input v-model="form.alias" placeholder="What do you call them?" />
      </div>
    </div>

    <div class="form-section">
      <h2 class="form-section-title">Contact Info</h2>
      <div class="form-row">
        <div class="form-group">
          <label>Phone</label>
          <input 
            v-model="form.phone" 
            type="tel" 
            placeholder="(555) 555-5555"
            @input="formatPhoneInput"
          />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="Email address" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <h2 class="form-section-title">Social Handles</h2>
      <div v-for="(handle, i) in socialHandles" :key="i" class="handle-row">
        <input v-model="handle.platform" placeholder="Platform (Instagram, Snapchat...)" />
        <input v-model="handle.handle" placeholder="@handle" />
        <button type="button" class="btn btn-ghost remove-btn" @click="removeHandle(i)">✕</button>
      </div>
      <button type="button" class="btn btn-secondary" style="margin-top:0.5rem" @click="addHandle">
        + Add Handle
      </button>
    </div>

    <div class="form-section">
      <h2 class="form-section-title">The Important Stuff</h2>
      <div class="toggle-row">
        <label class="toggle-label" :class="{ active: form.hotdog }">
          <input type="checkbox" v-model="form.hotdog" />
          <span class="toggle-emoji">🌭</span>
          <span>Gave a hotdog</span>
          <span class="toggle-check">{{ form.hotdog ? '✓' : '' }}</span>
        </label>
        <label class="toggle-label" :class="{ active: form.taco }">
          <input type="checkbox" v-model="form.taco" />
          <span class="toggle-emoji">🌮</span>
          <span>Received a taco</span>
          <span class="toggle-check">{{ form.taco ? '✓' : '' }}</span>
        </label>
      </div>
    </div>

    <div class="form-section">
      <h2 class="form-section-title">Notes</h2>
      <div class="form-group">
        <textarea v-model="form.notes" rows="4" placeholder="Anything worth remembering..." />
      </div>
    </div>

    <div class="form-actions">
      <NuxtLink to="/" class="btn btn-secondary">Cancel</NuxtLink>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Saving...' : 'Save Contact' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.contact-form { display: flex; flex-direction: column; gap: 0.5rem; }

.form-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.form-section-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--yellow);
  margin-bottom: 1rem;
  letter-spacing: 0.03em;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 480px) {
  .form-row { grid-template-columns: 1fr; }
}

.handle-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  align-items: center;
}

.handle-row input { flex: 1; }
.remove-btn { padding: 0.4rem 0.6rem; color: var(--red) !important; flex-shrink: 0; }

.toggle-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s;
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 500;
}

.toggle-label input { display: none; }

.toggle-label.active {
  border-color: var(--yellow);
  color: var(--text);
  background: var(--yellow-dim);
}

.toggle-emoji { font-size: 1.3rem; }
.toggle-check { margin-left: auto; color: var(--yellow); font-weight: 700; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
</style>
