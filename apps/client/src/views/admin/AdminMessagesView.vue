<script setup lang="ts">
import { ChatSquare, Filter, Search, Check, Close, Monitor, Compass, Clock, View, CircleCheck, TopRight, Delete, TopLeft, Promotion, Iphone } from '@element-plus/icons-vue';
 import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { AdminMessageItem } from '@/types/admin/message'
import { formatDate } from '@/utils/formatDate'
import { ElMessage } from 'element-plus'
import { useAdminMessages } from '@/composables/useAdminMessages'
import { aboutProfileCard, siteConfig } from '@/config/site'
import MarkdownViewer from '@/views/postView/components/MarkdownViewer.vue'
import { isMobileDeviceLabel } from '@/utils'

const { messages, loadMessages, connect, approve, reject, remove, reply, batchApprove, batchReject, disconnect } = useAdminMessages()
//对状态数据进行处理
const dialogVisible = ref(false)
const dialogMode = ref<'view' | 'reply'>('view')
const statusType: Record<string, string> = {
  approved: '已通过',
  pending: '待审核',
  rejected: '已拒绝',
}
const currentPage = ref(1)
 const pageSize = ref(9)
const selectedRows = ref<AdminMessageItem[]>([])
const currentMessage = ref<AdminMessageItem | null>(null)
//回复留言
const replyPayload = ref({
  author: siteConfig.ownerName,
  content: '',
})
const resolveAvatar = (row: Pick<AdminMessageItem, 'authorType' | 'qq'>) => {
  if (row.authorType === 'admin') {
    return aboutProfileCard.avatar
  }

  return row.qq ? `https://q.qlogo.cn/g?b=qq&nk=${row.qq}&s=100` : ''
}
const deviceIcon = (device?: string) => (isMobileDeviceLabel(device) ? Iphone : Monitor)
//分页数据
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})
//搜索框
const searchText = ref('')
//默认状态
const status = ref('all')
//监听状态 变化了触发filter函数
const filteredData = computed(() => {
  return messages.value.filter(item => {
    const matchStatus = status.value === 'all' || item.status === status.value
    const matchSearch = !searchText.value
      || item.author.includes(searchText.value)
      || item.content.includes(searchText.value)
    return matchStatus && matchSearch
  })
})

watch([searchText, status], () => {
  currentPage.value = 1
})

const handleSelectionChange = (val: AdminMessageItem[]) => {
   selectedRows.value = val
}
//批量拒绝
const handleRejectClick = async () => {
   const pendingItems = selectedRows.value.filter(item => item.status === 'pending')
    if (pendingItems.length > 0) {
      await batchReject(pendingItems.map((item) => item.id))
      selectedRows.value = []
    }else{
        ElMessage({
         message: '当前无待审核留言',
        type: 'warning',
      })
   }
}
//批量通过
const handleApproveClick = async () => {
   const pendingItems = selectedRows.value.filter(item => item.status === 'pending')
    if (pendingItems.length > 0) {
      await batchApprove(pendingItems.map((item) => item.id))
      selectedRows.value = []
    }else{
      ElMessage({
        message: '当前无待审核留言',
        type: 'warning',
      })
   }
}
const openDialog = (id: string, mode: 'view' | 'reply') => {
  const message = messages.value.find((item) => item.id === id)
  if (!message) return
  currentMessage.value = message
  dialogMode.value = mode
  if (mode === 'reply') {
    replyPayload.value.author = siteConfig.ownerName
    replyPayload.value.content = ''
  }
  dialogVisible.value = true
}

// 打开查看弹窗
const view = (id: string) => {
  openDialog(id, 'view')
}

// 打开回复弹窗
const replyHandle = (id: string) => {
  openDialog(id, 'reply')
}

const closeDialog = () => {
  dialogVisible.value = false
  dialogMode.value = 'view'
  currentMessage.value = null
  replyPayload.value.content = ''
}

const submitReply = async () => {
  if (!currentMessage.value || !replyPayload.value.content.trim()) {
    ElMessage({ message: '请输入回复内容', type: 'warning' })
    return
  }
  await reply(currentMessage.value.id, {
    author: replyPayload.value.author,
    content: replyPayload.value.content.trim(),
  })
  closeDialog()
}

const openReplyFromDetail = () => {
  if (!currentMessage.value) return
  dialogMode.value = 'reply'
  replyPayload.value.author = siteConfig.ownerName
}

const removeCurrentMessage = async () => {
  if (!currentMessage.value) return
  await remove(currentMessage.value.id)
  closeDialog()
}
onMounted(async () => {
  //首先获取所有留言数据
  await loadMessages()
  //连接SSE
  connect()
})
onBeforeUnmount(disconnect)
</script>
<template>
  <!--展示留言状态-->
    <div class="flex align-center justify-center gap-8">
        
        <div class=" flex-1 h-172px max-w-[250px] border-solid border-[2px] border-gray-200 shadow-md rounded-4 flex items-center justify-center gap-4">
              <el-icon class="text-4xl text-gray-500 bg-gray-300 h-14 w-14 rounded-4 ">
                <ChatSquare />
              </el-icon>
              <div class="flex-col my-3px mx-0px">
                <p class="text-3xl font-bold m-0">{{ messages.length }}</p>
                <p class="text-sm text-gray-500 m-0">总留言</p>
              </div>
        </div>

        <div class=" flex-1 h-172px max-w-[250px] border-solid border-[2px] border-gray-200 shadow-md rounded-4 flex items-center justify-center gap-4">
              <el-icon class="text-4xl text-green-500 bg-green-100 h-14 w-14 rounded-4 ">
                <Check />
              </el-icon>
              <div class="flex-col my-3px mx-0px">
                <p class="text-3xl font-bold m-0">{{ messages.filter(item => item.status === 'approved').length }}</p>
                <p class="text-sm text-gray-500 m-0">已通过</p>
              </div>
        </div>
       <div class=" flex-1 h-172px max-w-[250px] border-solid border-[2px] border-gray-200 shadow-md rounded-4 flex items-center justify-center gap-4">
              <el-icon class="text-4xl text-yellow-500 bg-yellow-100 h-14 w-14 rounded-4 ">
                <Clock />
              </el-icon>
              <div class="flex-col my-3px mx-0px">
                <p class="text-3xl font-bold m-0">{{ messages.filter(item => item.status === 'pending').length }}</p> 
                <p class="text-sm text-gray-500 m-0">待审核</p>
              </div>
        </div>

        <div class=" flex-1 h-172px max-w-[250px] border-solid border-[2px] border-gray-200 shadow-md rounded-4 flex items-center justify-center gap-4">
              <el-icon class="text-4xl text-red-500 bg-red-100 h-14 w-14 rounded-4 ">
                <Close />
              </el-icon>
              <div class="flex-col my-3px mx-0px">
                <p class="text-3xl font-bold m-0">{{ messages.filter(item => item.status === 'rejected').length }}</p>
                <p class="text-sm text-gray-500 m-0">已拒绝</p>
              </div>
        </div>
  
    </div>
  <!--搜索框-->
    <div class="flex items-center justify-center mt-8">
        <div class="flex items-center justify-between  w-[1150px] border-solid border-[2px] border-gray-200 shadow-md rounded-4  bg-white h-117px ">
       <div class="left">
          <el-input class="w-224px ml-30px h-36px"  v-model="searchText" placeholder="搜索昵称或内容">
            <template #prefix>
            <el-icon><Search /></el-icon>
         </template></el-input>
           <el-select class="w-120px ml-10px h-32px" v-model="status" placeholder="全部状态">
            <template #prefix>
            <el-icon><Filter /></el-icon>
            </template>
            <el-option label="全部" value="all" />
            <el-option label="已通过" value="approved" />
            <el-option label="待审核" value="pending" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </div>
          <!--右侧按钮-->
          <div class="right flex items-center" v-if="selectedRows.length > 0">
               <p class="text-sm text-gray-500 m-0">已选{{ selectedRows.length }}项</p>
               <el-button :icon="Check" class=" approve-btn w-94px h-32px !rounded-2 ml-10px bg-[#111111] text-[#fff]" size="small" @click="handleApproveClick">批量通过</el-button>
               <el-button :icon="Close" class="mr-14px reject-btn w-94px h-32px !rounded-2 ml-10px bg-[#dc2626] text-[#fff]" size="small" @click="handleRejectClick">批量拒绝</el-button>
          </div>
          </div>
    </div>
  <!--留言表格-->
   <div class="flex justify-center mt-8 px-4">
     <div class="w-full max-w-[1400px] overflow-hidden rounded-4 border-solid border-[2px] border-gray-200 bg-white shadow-md">
     <el-table :data="pagedData" class="w-full" stripe @selection-change="handleSelectionChange">
       <el-table-column type="selection" width="55" label="选择" />
       <el-table-column prop="id" label="序号" min-width="60">
        <template #default="{ row, $index }">
          {{ (currentPage - 1) * pageSize + $index + 1 }}
        </template>
       </el-table-column>

        <el-table-column prop="author" label="留言者" min-width="150">
          <template #default="{ row }">
            <div class="author-info flex gap-1">
              <el-avatar :src="resolveAvatar(row)" :size="40" />
              <div class="author-detail">
                <p class="text-sm font-bold m-0 text-black">{{ row.author }}</p>
                <p class="text-[11px] text-gray-500 m-0">{{ row.location }}</p>
              </div>
              <div class="isAdmin" v-if="row.authorType === 'admin'">
                <p class="text-[11px] text-white bg-black px-2.1 border rounded-20px m-0">博主</p>
              </div>
            </div>
          </template>
        </el-table-column>

       <el-table-column label="内容" min-width="250">
         <template #default="{ row }">
           <div class="truncate max-w-[300px]">{{ row.content }}</div>
         </template>
       </el-table-column>

       <el-table-column prop="status" label="状态" min-width="90">
         <template #default="{ row }">
           <el-tag
             :type="row.status === 'approved' ? 'success' : row.status === 'pending' ? 'warning' : 'danger'"
             effect="plain"
             round
           >
             <el-icon class="mr-1" v-if="row.status === 'approved'"><Check /></el-icon>
             <el-icon class="mr-1" v-else-if="row.status === 'pending'"><Clock /></el-icon>
             <el-icon class="mr-1" v-else><Close /></el-icon>
             {{statusType[row.status]}}
           </el-tag>
         </template>
       </el-table-column>

        <el-table-column label="环境" min-width="110">
          <template #default="{ row }">
            <div class="text-xs text-gray-500">
              <div><el-icon class="mr-1"><component :is="deviceIcon(row.device)" /></el-icon>{{ row.device }}</div>
              <div><el-icon class="mr-1"><Compass /></el-icon>{{ row.browser }}</div>
            </div>
          </template>
       </el-table-column>

       <el-table-column prop="createdAt" label="时间" min-width="130">
         <template #default="{ row }">
           {{ formatDate(row.createdAt,'short') }}
         </template>
      </el-table-column>

       <el-table-column label="操作" width="320" fixed="right">
         <template #default="{ row }">
            <div class="flex justify-around w-full">
             <el-tooltip content="查看" placement="top">
               <el-button text @click="view(row.id)"><el-icon class="text-lg"><View /></el-icon></el-button>
             </el-tooltip>
              <el-tooltip v-if="row.status === 'pending'" content="通过" placement="top">
                <el-button text @click="approve(row.id)"><el-icon class="text-lg text-green-500"><CircleCheck /></el-icon></el-button>
              </el-tooltip>
              <el-tooltip v-if="row.status === 'pending'" content="拒绝" placement="top">
                <el-button text @click="reject(row.id)"><el-icon class="text-lg text-red-500"><Close /></el-icon></el-button>
              </el-tooltip>
              <el-tooltip content="回复" placement="top">
                <el-button text @click="replyHandle(row.id)"><el-icon class="text-lg"><TopRight /></el-icon></el-button>
             </el-tooltip>
             <el-tooltip content="删除" placement="top">
               <el-button text @click="remove(row.id)"><el-icon class="text-lg text-red-500"><Delete /></el-icon></el-button>
             </el-tooltip>
           </div>
         </template>
       </el-table-column>
 </el-table>

      <div class="table-pagination-bar flex items-center justify-between px-6 py-5">
        <p class="m-0 text-sm text-gray-500">共 {{ messages.length }} 条留言</p>
        <el-pagination
          v-model:current-page="currentPage"
          :total="messages.length"
          :page-size="pageSize"
          layout="prev, pager, next"
        />
      </div>
    </div>
   </div>
   <!--回复留言弹窗-->
   <el-dialog
    :title="dialogMode === 'reply' ? '回复留言' : '留言详情'"
    v-model="dialogVisible"
    align-center
    :class="['border', 'rounded-[22px]', 'bg-gray-100', 'p-5', 'w-[550px]']"
  >
   <template #header>
         <div class="dialog-header">
           <div class="header-left flex items-center">
             <span class="header-title text-[17px] font-bold">{{ dialogMode === 'reply' ? '回复留言' : '留言详情' }}</span>
           </div>
         </div>
    </template>

    <div v-if="currentMessage" class="visitor-info ml-8">
      <div class="author-info flex gap-1">
        <el-avatar :src="resolveAvatar(currentMessage)" :size="40" />
        <div class="author-detail">
          <div class="flex items-center gap-2">
            <p class="text-sm font-bold m-0 text-black">{{ currentMessage.author }}</p>
            <div
              class="inline-flex items-center rounded-20px px-2.5 py-0.5 text-[12px]"
              :class="currentMessage.status === 'approved'
                ? 'bg-green-100 text-green-600'
                : currentMessage.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-red-100 text-red-500'"
            >
              <el-icon class="mr-1" v-if="currentMessage.status === 'approved'"><Check /></el-icon>
              <el-icon class="mr-1" v-else-if="currentMessage.status === 'pending'"><Clock /></el-icon>
              <el-icon class="mr-1" v-else><Close /></el-icon>
              {{ statusType[currentMessage.status] }}
            </div>
          </div>
          <p class="text-[11px] text-gray-500 m-0">{{ currentMessage.location }}</p>
        </div>
        <div v-if="currentMessage.authorType === 'admin'" class="isAdmin">
          <p class="text-[11px] text-white bg-black px-2.1 border rounded-20px m-0">博主</p>
        </div>
      </div>
    </div>

    <template v-if="dialogMode === 'view' && currentMessage">
      <div class="mx-8 mt-4 rounded-4 border border-solid border-[#ededed] bg-[#f5f5f5] px-5 py-4 text-[16px] text-[#2f2f2f] leading-7">
        {{ currentMessage.content }}
      </div>

      <div class="mx-8 mt-5 grid grid-cols-2 gap-y-3 text-[14px] text-gray-500">
        <div class="flex items-center gap-2"><el-icon><Clock /></el-icon>{{ formatDate(currentMessage.createdAt, 'short') }}</div>
        <div class="flex items-center gap-2"><el-icon><Compass /></el-icon>{{ currentMessage.location }}</div>
        <div class="flex items-center gap-2"><el-icon><component :is="deviceIcon(currentMessage.device)" /></el-icon>{{ currentMessage.device }}</div>
        <div class="flex items-center gap-2"><el-icon><Compass /></el-icon>{{ currentMessage.browser }}</div>
      </div>

      <div class="mx-8 mt-5 border-t border-solid border-gray-200"></div>

      <div class="mx-8 mt-5 flex items-center gap-3">
        <el-button style="--el-button-border-color:#e5e7eb;--el-button-text-color:#111111;--el-button-hover-border-color:#d1d5db;--el-button-hover-text-color:#111111" @click="openReplyFromDetail">
          <el-icon><TopLeft /></el-icon>
          回复
        </el-button>
        <el-button type="danger" style="--el-button-bg-color:#ff2e2e;--el-button-border-color:#ff2e2e;--el-button-hover-bg-color:#ff4d4f;--el-button-hover-border-color:#ff4d4f" @click="removeCurrentMessage">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </div>
    </template>

    <template v-else>
      <div class="msg-input">
        <div class="reply-body px-8 mt-4">
          <el-input v-model="replyPayload.content" type="textarea" :rows="4" placeholder="输入你的回复吧" />
        </div>
        <div v-if="replyPayload.content" class="reply-content px-8 mt-5">
          <MarkdownViewer :content="replyPayload.content" editor-id="admin-reply" />
        </div>
      </div>
    </template>

    <template #footer>
      <template v-if="dialogMode === 'reply'">
        <el-button style="--el-button-border-color:#e5e7eb;--el-button-text-color:#6b7280;--el-button-hover-border-color:#d1d5db;--el-button-hover-text-color:#374151" @click="closeDialog">
          取消
        </el-button>

        <el-button type="primary" style="--el-button-bg-color:#374151;--el-button-border-color:#374151;--el-button-hover-bg-color:#4b5563;--el-button-hover-border-color:#4b5563;--el-button-active-bg-color:#1f2937" @click="submitReply">
          <el-icon><Promotion /></el-icon>
          发送回复
        </el-button>
      </template>
    </template>
  </el-dialog>

</template>

<style scoped>
.approve-btn:hover,
.approve-btn:focus {
  background-color: #111 !important;
  border-color: #111 !important;
  color: #fff !important;
}
.reject-btn:hover,
.reject-btn:focus {
  background-color: #dc2626 !important;
  border-color: #dc2626 !important;
  color: #fff !important;
}

.table-pagination-bar {
  border-top: 1px solid #e5e7eb;
}

.table-pagination-bar :deep(.el-pagination) {
  gap: 10px;
}

.table-pagination-bar :deep(.btn-prev),
.table-pagination-bar :deep(.btn-next),
.table-pagination-bar :deep(.el-pager li) {
  min-width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  color: #111111;
  font-weight: 500;
}

.table-pagination-bar :deep(.el-pager li.is-active) {
  border-color: #111111;
  background: #111111;
  color: #ffffff;
}

.table-pagination-bar :deep(.btn-prev:disabled),
.table-pagination-bar :deep(.btn-next:disabled) {
  color: #c4c4c4;
  background: #ffffff;
}
:deep(.el-textarea__inner) {
  border: 1px solid #8f7d7d !important;
  border-radius: 8px !important;
  font-size: 16px !important;
}
:deep(.el-textarea__inner:focus) {
  border-color: #3b4042 !important;
  box-shadow: 0 0 0 1px #3b4042 inset !important;
}

</style>
