<script setup lang="ts">
import { computed } from 'vue'
import { ChatLineRound, Clock, Location, Monitor } from '@element-plus/icons-vue'
import MarkdownViewer from '@/views/postView/components/MarkdownViewer.vue'
import type { GuestbookEntry } from '@/types/message'
import { formatDate } from '@/utils'

defineOptions({ name: 'GuestbookThreadItem' })

const props = withDefaults(defineProps<{
  item: GuestbookEntry
  repliesByParentId: Record<string, GuestbookEntry[]>
  ownerAvatar: string
  level?: number
  activeReplyId?: string
}>(), {
  level: 0,
  activeReplyId: '',
})

const emit = defineEmits<{
  reply: [item: GuestbookEntry]
}>()
//递归实现的子项
const children = computed(() => props.repliesByParentId[props.item.id] ?? [])
const isAdmin = computed(() => props.item.authorType === 'admin')
const initials = computed(() => props.item.author.slice(0, 1).toUpperCase())
const formattedTime = computed(() => formatDate(props.item.createdAt, 'short'))
const statusLabel = computed(() => props.item.status === 'pending'
  ? '待审核'
  : props.item.status === 'rejected'
    ? '已拒绝'
    : '')

const qqAvatar = (qq?: string) => qq ? `https://q.qlogo.cn/g?b=qq&nk=${qq}&s=100` : ''

const avatarSrc = computed(() => {
  if (isAdmin.value) return props.ownerAvatar
  return qqAvatar(props.item.qq || '')
})

const handleReply = () => emit('reply', props.item)
const forwardReply = (item: GuestbookEntry) => emit('reply', item)
</script>

<template>
  <article :class="['thread-item', { 'thread-item--nested': level > 0 }]">
    <div class="thread-item__main">
      <el-avatar class="thread-item__avatar" :size="level > 0 ? 30 : 40" :src="avatarSrc">
        {{ initials }}
      </el-avatar>

      <div class="thread-item__body">
        <div class="thread-item__header">
          <div class="thread-item__title-row">
            <strong class="thread-item__author">{{ item.author }}</strong>
            <span v-if="isAdmin" class="thread-item__badge">博主</span>
            <span v-if="item.replyToAuthor" class="thread-item__reply-to">回复 {{ item.replyToAuthor }}</span>
            <el-tag v-if="statusLabel" size="small" type="warning" round>
              {{ statusLabel }}
            </el-tag>
          </div>

          <el-button
            link
            type="info"
            class="thread-item__reply-btn"
            :class="{ 'thread-item__reply-btn--active': activeReplyId === item.id }"
            @click="handleReply"
          >
            <el-icon><ChatLineRound /></el-icon>
            <span>{{ activeReplyId === item.id ? '回复中' : '回复' }}</span>
          </el-button>
        </div>

        <div class="thread-item__content-wrap">
          <MarkdownViewer :content="item.content" :editor-id="`guestbook-${item.id}`" />
        </div>

        <div class="thread-item__meta">
          <span class="thread-item__meta-item">
            <el-icon><Clock /></el-icon>
            <span>{{ formattedTime }}</span>
          </span>
          <span v-if="item.location" class="thread-item__meta-item">
            <el-icon><Location /></el-icon>
            <span>{{ item.location }}</span>
          </span>
          <span v-if="item.device" class="thread-item__meta-item">
            <el-icon><Monitor /></el-icon>
            <span>{{ item.device }}</span>
          </span>
          <span v-if="item.browser" class="thread-item__meta-item">
            <span>{{ item.browser }}</span>
          </span>
        </div>
      </div>
    </div>

    <div v-if="children.length" class="thread-item__children">
      <GuestbookThreadItem
        v-for="child in children"
        :key="child.id"
        :item="child"
        :level="level + 1"
        :owner-avatar="ownerAvatar"
        :replies-by-parent-id="repliesByParentId"
        :active-reply-id="activeReplyId"
        @reply="forwardReply"
      />
    </div>
  </article>
</template>

<style scoped>
.thread-item {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.thread-item__main {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
}

.thread-item--nested .thread-item__main {
  grid-template-columns: minmax(0, 1fr);
}

.thread-item__avatar {
  flex-shrink: 0;
  background-size: cover;
  background-position: center;
  font-weight: 600;
}

.thread-item__body {
  min-width: 0;
  max-height: 300px;
  height: auto;     
  overflow-y: auto;
}

.thread-item__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.thread-item__title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.9rem;
}

.thread-item__author {
  font-size: 1.08rem;
  font-weight: 700;
  color: #111111;
}

.thread-item--nested .thread-item__author {
  font-size: 0.98rem;
}

.thread-item__badge {
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  padding: 0 0.4rem;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  font-size: 0.76rem;
  font-weight: 600;
}

.thread-item__reply-to {
  color: #6b7280;
  font-size: 0.9rem;
}

.thread-item__reply-btn {
  padding: 0;
  font-size: 0.9rem;
}

.thread-item__reply-btn :deep(.el-button) {
  gap: 0.3rem;
}

.thread-item__reply-btn--active {
  color: #111111;
}

.thread-item__content-wrap {
  margin-top: 0.1rem;
  overflow: hidden;
}

.thread-item__content {
  margin: 0;
  color: #111111;
  font-size: 1rem;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.thread-item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 0.1rem;
  color: #8b9098;
  font-size: 0.9rem;
}

.thread-item__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.thread-item__children {
  margin-left: calc(44px + 0.9rem);
  padding-left: 1.6rem;
  border-left: 1px solid rgba(17, 17, 17, 0.12);
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}

@media (max-width: 767px) {
  .thread-item__main,
  .thread-item--nested .thread-item__main {
    grid-template-columns: 1fr;
  }

  .thread-item__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .thread-item__children {
    margin-left: 0;
    padding-left: 1rem;
  }
}
</style>
