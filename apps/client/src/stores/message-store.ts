import { ref } from 'vue'
import { defineStore } from 'pinia'

const MESSAGE_SENDER_ID_KEY = 'message:sender-id'

function loadSenderId() {
  const raw = localStorage.getItem(MESSAGE_SENDER_ID_KEY)
  return raw || crypto.randomUUID()
}

export const useMessageStore = defineStore('message', () => {
  const senderId = ref(loadSenderId())
  localStorage.setItem(MESSAGE_SENDER_ID_KEY, senderId.value)

  return {
    senderId
  }
})
