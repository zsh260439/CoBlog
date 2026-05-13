import { ref } from 'vue'
import { defineStore } from 'pinia'

const VISITOR_SENDER_ID_KEY = 'visitor:sender-id'

function loadSenderId() {
  const raw = localStorage.getItem(VISITOR_SENDER_ID_KEY)
  return raw || crypto.randomUUID()
}

export const useVistorStore = defineStore('vistor', () => {
  const senderId = ref(loadSenderId())
  localStorage.setItem(VISITOR_SENDER_ID_KEY, senderId.value)

  return {
    senderId,
  }
})
