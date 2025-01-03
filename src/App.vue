<script setup>
import {computed, onBeforeUnmount, onMounted, onUnmounted, ref} from 'vue';
import { useRoute } from 'vue-router';
import AsideComponent from '@/components/AsideComponent.vue';
import { useUserStore } from '@/stores/UserStore';
import { springAPI } from '@/services/axios.js';
import EmployeeProfile from "@/components/EmployeeProfile.vue";
import ChatModal from '@/components/ChatModal.vue';
import ChatBotModal from "@/components/ChatBotModal.vue";
import { getGroupChatRoomSeq, getMentoringChatRoomSeq } from "@/services/ChatApi.js"; // API 추가

// Vue Router 및 전역 스토어 설정
const route = useRoute();
const userStore = useUserStore();

// 상태 정의
const shouldShowAside = computed(() => !route.meta.hideAside);

const shouldShowProfile = ref(false);
const isChatModalVisible = ref(false);
const isChatBotModalVisible = ref(false);
const activeMenu = ref(null);
const showAdditionalButtons = ref(false); // 추가 버튼 표시 여부

const chatType = ref(null); // 'mentor' or 'group'
const chatRoomSeq = ref(null); // 채팅방 시퀀스

// 채팅 모달 토글
const toggleChatModal = async (type) => {
  chatType.value = type;  // chatType 설정
  isChatModalVisible.value = !isChatModalVisible.value; // 모달 가시성 토글

  try {
    // API 호출: Mentor 또는 Group 타입 확인 후 시퀀스 불러오기
    if (type === 'mentor') {
      chatRoomSeq.value = await getMentoringChatRoomSeq(userStore.getEmployeeInfo().employeeSeq);
    } else if (type === 'group') {
      chatRoomSeq.value = await getGroupChatRoomSeq(userStore.getEmployeeInfo().employeeSeq);
    }
    console.log(`${type} Room Seq: ${chatRoomSeq.value}`);
  } catch (error) {
    console.error("채팅방 시퀀스 불러오기 실패:", error);
  }
};


// 챗봇 모달 토글
const toggleChatBotModal = () => {
  isChatBotModalVisible.value = !isChatBotModalVisible.value;
};

// 프로필 활성화 토글
const toggleProfile = (data) => {
  shouldShowProfile.value = data;

  // 프로필 활성화 시 메뉴 비활성화
  if (shouldShowProfile.value) {
    activeMenu.value = null;
  }
};

// 메뉴 토글
const toggleMenu = (data) => {
  shouldShowProfile.value = false;
  activeMenu.value = data;
};

// 외부 클릭 감지하여 Profile 및 SubMenu 비활성화
const hideComponentsOnOutsideClick = (event) => {
  const profileElement = document.querySelector('.profile');
  const asideMenuElement = document.querySelector('.aside');

  if (!event.target.closest('.profile') && !event.target.closest('.menu-item')) {
    shouldShowProfile.value = false;
    activeMenu.value = null;
  }
};

// 추가 버튼 가시성 토글
const toggleButtons = () => {
  showAdditionalButtons.value = !showAdditionalButtons.value;
};

// 컴포넌트가 마운트될 때 이벤트 초기화
onMounted(() => {
  if (userStore.accessToken) {
    springAPI.defaults.headers.common['Authorization'] = `Bearer ${userStore.accessToken}`;
    userStore.isAuthenticated = true;
  }

  userStore.initializeInterceptors(); // Axios 인터셉터 초기화

  // 외부 클릭 이벤트 등록
  document.addEventListener('mousedown', hideComponentsOnOutsideClick);
});

// 컴포넌트가 언마운트될 때 이벤트 제거
onUnmounted(() => {
  document.removeEventListener('mousedown', hideComponentsOnOutsideClick);
});
</script>

<template>
  <div id="app">
    <!-- Aside 렌더링 -->
    <AsideComponent
        class="aside"
        v-if="shouldShowAside"
        @profile-modal="toggleProfile"
        :active-menu="activeMenu"
        @update-active-menu="toggleMenu"
    />

    <!-- Employee Profile -->
    <EmployeeProfile
        class="profile"
        v-if="shouldShowProfile"
        @should-show-profile="toggleProfile"
    />

    <!-- Router View -->
    <div class="router-container">
      <router-view />
    </div>

    <!-- 메인 채팅 버튼 -->
    <div v-if="userStore.isAuthenticated" class="chat-button-in-main" @click="toggleButtons">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-dots" viewBox="0 0 16 16">
        <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
        <path d="M2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9 9 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.4 10.4 0 0 1-.524 2.318l-.003.011a11 11 0 0 1-.244.637c-.079.186.074.394.273.362a22 22 0 0 0 .693-.125m.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6-3.004 6-7 6a8 8 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a11 11 0 0 0 .398-2"/>
      </svg>
    </div>

    <!-- 추가 버튼 -->
    <div :class="['additional-buttons', { show: showAdditionalButtons }]">
      <button class="additional-button-chatBot" @click="toggleChatBotModal"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-robot" viewBox="0 0 16 16">
        <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135"/>
        <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/>
      </svg></button>
      <button class="additional-button"  @click="toggleChatModal('mentor')"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-person-badge" viewBox="0 0 16 16">
        <path d="M6.5 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
        <path d="M4.5 0A2.5 2.5 0 0 0 2 2.5V14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2.5A2.5 2.5 0 0 0 11.5 0zM3 2.5A1.5 1.5 0 0 1 4.5 1h7A1.5 1.5 0 0 1 13 2.5v10.795a4.2 4.2 0 0 0-.776-.492C11.392 12.387 10.063 12 8 12s-3.392.387-4.224.803a4.2 4.2 0 0 0-.776.492z"/>
      </svg></button>
      <button class="additional-button"  @click="toggleChatModal('group')" ><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
        <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
      </svg></button>
    </div>

    <!-- Chat Modal -->
    <ChatModal
        :isVisible="isChatModalVisible"
        @update:isVisible="isChatModalVisible = $event"
        :chatType="chatType"
        :chatRoomSeq="chatRoomSeq"
    />

    <!-- ChatBot Modal -->
    <ChatBotModal
        :isVisible="isChatBotModalVisible"
        @update:isVisible="isChatBotModalVisible = $event"
        iframeSrc="http://192.168.1.6:8501/"
    />
  </div>
</template>

<style scoped>
#app {
  display: flex;
  height: 100vh;
  background-color: var(--ivory);
}

.router-container {
  flex-grow: 1;
  height: 100vh;
  overflow: auto;
  flex-direction: column;
  align-items: center;
}

.aside {
  height: 100vh;
  position: relative;
}

.profile {
  position: absolute;
  margin-top: 150px;
  margin-left: 210px;
}

.chat-button-in-main {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 15px;
  background-color: var(--purple);
  color: white;
  font-size: 16px;
  border-radius: 50%;
  cursor: pointer;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.additional-buttons {
  display: flex;
  flex-direction: column-reverse;
  position: fixed;
  bottom: 74px;
  right: 20px;
  gap: 10px;
  opacity: 0;
  transform: translateY(20%);
  transition: transform 0.3s ease, opacity 0.3s ease;
  pointer-events: none;
  z-index: 0;
}

.additional-buttons.show {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.additional-button, .additional-button-chatBot {
  background-color: var(--yellow);
  color: white;
  padding: 13px 15px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.additional-button:hover, .additional-button-chatBot:hover {
  background-color: var(--black);
}
</style>
