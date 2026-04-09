<script setup lang="ts">
const props = defineProps<{
  contactId: string
  currentPath?: string | null
}>()

const emit = defineEmits<{
  uploaded: [path: string, signedUrl: string]
}>()

const uploading = ref(false)
const error = ref('')
const previewUrl = ref<string | null>(null)

// Load signed URL for existing photo
onMounted(async () => {
  if (props.currentPath) {
    try {
      const { signedUrl } = await $fetch<{ signedUrl: string }>('/api/photos/signed-url', {
        params: { path: props.currentPath },
      })
      previewUrl.value = signedUrl
    } catch {}
  }
})

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Preview
  previewUrl.value = URL.createObjectURL(file)

  // Upload
  uploading.value = true
  error.value = ''
  try {
    const formData = new FormData()
    formData.append('photo', file)
    formData.append('contactId', props.contactId)

    const result = await $fetch<{ path: string; signedUrl: string }>('/api/photos/upload', {
      method: 'POST',
      body: formData,
    })

    previewUrl.value = result.signedUrl
    emit('uploaded', result.path, result.signedUrl)
  } catch (e: any) {
    error.value = e.message ?? 'Upload failed'
    previewUrl.value = null
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="photo-upload">
    <div class="avatar-preview">
      <img v-if="previewUrl" :src="previewUrl" alt="Contact photo" class="preview-img" />
      <span v-else class="avatar-placeholder">📷</span>
      <label class="upload-overlay" :class="{ uploading }">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="file-input"
          @change="handleFileChange"
          :disabled="uploading"
        />
        <span>{{ uploading ? 'Uploading...' : 'Change photo' }}</span>
      </label>
    </div>
    <div v-if="error" class="upload-error">{{ error }}</div>
  </div>
</template>

<style scoped>
.photo-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.avatar-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg-elevated);
  border: 2px solid var(--border-light);
  cursor: pointer;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 2.5rem;
}

.upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
  font-size: 0.75rem;
  color: #fff;
  text-align: center;
  padding: 0.5rem;
}

.avatar-preview:hover .upload-overlay {
  opacity: 1;
}

.upload-overlay.uploading {
  opacity: 1;
}

.file-input {
  display: none;
}

.upload-error {
  font-size: 0.75rem;
  color: #fca5a5;
  text-align: center;
}
</style>
