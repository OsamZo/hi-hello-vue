<template>
  <div v-if="isVisible" class="chat-modal-overlay">
    <div
        class="chat-modal"
        :style="{ left: position.x + 'px', top: position.y + 'px' }"
        @mousedown="handleMouseDown"
    >
      <div class="modal-header">
        <div>{{ chatType === 'mentor' ? '멘토링' : '그룹 채팅' }}</div>
        <button @click="closeModal" class="chatBot-modal-delete-button">X</button>
      </div>
      <div class="modal-body">
        <Chatting :chatRoomSeq="chatRoomSeq"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, defineProps, defineEmits, onMounted, onUnmounted} from 'vue';
import Chatting from '@/views/chat/Chatting.vue';

const props = defineProps({
  isVisible: Boolean,
  chatType: String,
  chatRoomSeq: String,
});

const emit = defineEmits(['update:isVisible']); // 부모로부터 isVisible 업데이트 받을 수 있게 설정

// 위치 변수
const position = ref({x: 200, y: 200});  // 초기 위치 설정
let isDragging = ref(false); // 드래그 여부
let dragStartX = ref(0); // 드래그 시작 X 좌표
let dragStartY = ref(0); // 드래그 시작 Y 좌표

// 모달 닫기
const closeModal = () => {
  emit('update:isVisible', false);
};

// 드래그 시작
const handleMouseDown = (event) => {
  isDragging.value = true;
  dragStartX.value = event.clientX - position.value.x;
  dragStartY.value = event.clientY - position.value.y;

  // 마우스 커서가 draggable된 모달 내에서 움직여도 스크롤이 발생하지 않도록 막기
  document.body.style.userSelect = 'none';
};

// 드래그 중 위치 업데이트
const handleMouseMove = (event) => {
  if (isDragging.value) {
    position.value.x = event.clientX - dragStartX.value;
    position.value.y = event.clientY - dragStartY.value;
  }
};

// 드래그 종료
const handleMouseUp = () => {
  isDragging.value = false;
  document.body.style.userSelect = '';  // drag 종료 후 userSelect 원래대로 복원
};

// 마우스 이벤트 설정
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
});
</script>

<style scoped>
.chat-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 600;
}

.chat-modal {
  background-color: var(--white);
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  cursor: move;
  position: absolute;
  height: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  font-weight: 600;
  border-bottom: 1px solid var(--gray);
}

.chatBot-modal-delete-button {
  border: none;
  background-color: var(--white);
}
</style>
