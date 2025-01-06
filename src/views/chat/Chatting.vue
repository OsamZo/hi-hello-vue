<template>
  <div class="chat-container">
    <!-- 채팅방 존재 여부 체크 -->
    <div v-if="!roomId" class="no-chat-room">
      <p>유효한 채팅방을 선택하세요.</p>
    </div>
    <div v-else>
      <!-- 메시지 목록 -->
      <div ref="messagesContainer" class="messages">
        <div
            v-for="(msg, index) in messages"
            :key="index"
            class="message"
            :class="{
          'message-right': msg.userCode === Number(currentUserCode.trim()),
          'message-left': msg.userCode !== Number(currentUserCode.trim())
        }">
          <div class="chat-name">
            {{ msg.userName }}
            <div class="chat-date">{{ msg.createdAt }}</div>
          </div>
          <div class="chat-message-content">{{ msg.message }}</div>
        </div>
      </div>

      <!-- 메시지 입력란 -->
      <div class="input-container">
        <input
            type="text"
            v-model="messageContent"
            placeholder="메시지를 입력하세요"
            @keyup.enter="sendMessage"
        />
        <button @click="sendMessage" :disabled="!connected">보내기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { Client } from "@stomp/stompjs";
import { useUserStore } from "@/stores/UserStore.js";
import { getChatMessages } from "@/services/ChatApi.js";

// Props 정의
const props = defineProps({
  chatRoomSeq: String, // 부모로부터 전달받는 채팅방 ID
});

// 상태 관리 변수 선언
const stompClient = ref(null);
const messages = ref([]);
const messageContent = ref("");
const roomId = ref(null); // 초기 값은 null
const connected = ref(false);
const currentUserCode = useUserStore().getEmployeeInfo().employeeSeq;
const socketUrl = import.meta.env.VITE_API_CHAT_URL; // WebSocket URL

// WebSocket 연결
const connect = () => {
  const authStore = useUserStore();
  const token = authStore.accessToken;

  // if (!roomId.value) {
  //   console.log("roomId가 누락되었습니다.");
  //   return;
  // }
  //
  // if (!token) {
  //   console.error("토큰이 누락되었습니다!");
  //   return;
  // }

  stompClient.value = new Client({
    brokerURL: socketUrl,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  stompClient.value.onConnect = () => {
    connected.value = true;
    subscribeToChat(); // 채팅 구독 시작
  };

  stompClient.value.onStompError = (frame) => {
    console.error("STOMP 연결 에러:", frame.headers["message"]);
    connected.value = false;
  };

  stompClient.value.activate();
};

// 메시지 구독
const subscribeToChat = () => {
  if (!stompClient.value || !roomId.value) {
    console.error("STOMP Client 또는 Room ID가 없습니다.");
    return;
  }

  stompClient.value.subscribe(`/sub/${roomId.value}`, (message) => {
    try {
      const parsedMessage = JSON.parse(message.body);
      handleIncomingMessage(parsedMessage);
    } catch (error) {
      console.error("메시지 파싱 중 오류 발생:", error);
    }
  });
};

// 수신 메시지 처리
const handleIncomingMessage = (message) => {
  const exists = messages.value.some(
      (msg) => msg.createdAt === message.createdAt && msg.message === message.message
  );
  if (!exists) {
    messages.value.push({
      message: message.message,
      userCode: message.userCode,
      userName: message.userName,
      createdAt: message.createdAt,
    });
  }
};


// 메시지 전송
const sendMessage = () => {
  if (!messageContent.value.trim()) return;

  const authStore = useUserStore();
  const token = authStore.accessToken;

  const message = {
    roomId: roomId.value,
    userCode: currentUserCode,
    message: messageContent.value,
    createdAt: new Date().toISOString(),
  };

  if (stompClient.value && token) {
    stompClient.value.publish({
      destination: `/pub/${roomId.value}`,
      body: JSON.stringify(message),
      headers: { Authorization: `Bearer ${token}` },
    });

    messageContent.value = ""; // 입력창 초기화
  }
};

// WebSocket 연결 해제
const disconnect = () => {
  if (stompClient.value) {
    stompClient.value.deactivate();
    connected.value = false;
  }
};

// 채팅 메시지 목록 불러오기
const getChatMessageList = async () => {
  try {
    if (!roomId.value) {
      // console.log("유효하지 않은 roomId로 메시지를 조회할 수 없습니다.");
      return;
    }

    const response = await getChatMessages(roomId.value);
    if (response && response.data) {
      messages.value = response.data.map(msg => ({ ...msg }));
    }
  } catch (error) {
    console.error("채팅 메시지 불러오기 실패:", error);
    messages.value = [];
  }
};

// Props의 chatRoomSeq 변경 감지
watch(() => props.chatRoomSeq, async (newChatRoomSeq, oldChatRoomSeq) => {
  if (newChatRoomSeq) {
    roomId.value = newChatRoomSeq; // roomId 업데이트
    // console.log("chatRoomSeq 변경:", newChatRoomSeq);

    disconnect(); // 기존 WebSocket 연결 해제
    messages.value = []; // 메시지 초기화
    await getChatMessageList(); // 새로운 roomId로 메시지 불러오기
    connect(); // WebSocket 재연결
  } else {
    roomId.value = null; // roomId 초기화
    // console.log("chatRoomSeq가 비어 있습니다.");
  }
}, { immediate: true });

// 컴포넌트 생성 및 소멸 시 이벤트 처리
onMounted(() => {
  if (props.chatRoomSeq) {
    roomId.value = props.chatRoomSeq; // 초기 roomId 설정
    getChatMessageList(); // 초기 메시지 로드
    connect(); // 초기 WebSocket 연결
  }
});

onBeforeUnmount(() => {
  disconnect(); // WebSocket 연결 해제
});
</script>

<style scoped>
.chat-container {
  max-width: 700px;
  padding: 0px 20px;
}

.chat-name {
  font-weight: 600;
  font-size: 15px;
  display: flex;
}

.messages {
  max-height: 350px;
  overflow-y: auto;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 4px;
}

.chat-message-content {
  margin: 5px 0px;
}

.chat-date {
  font-size: 13px;
  font-weight: 300;
  color: var(--gray);
  padding-left: 10px;
}

.message {
  margin-bottom: 10px;
  border-radius: 10px;
  padding: 8px;
}

.message-right {
  margin-left: 50px;
  background-color: var(--light-purple);
}

.message-left {
  margin-right: 50px;
  border: 2px solid var(--purple);
}

.input-container {
  display: flex;
  gap: 10px;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--gray);
  border-radius: 4px;
}

button {
  padding: 10px 15px;
  border: none;
  background-color: var(--purple);
  color: var(--white);
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: var(--black);
}

button:disabled {
  background-color: var(--gray);
  cursor: not-allowed;
}
</style>
