import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useUserStore } from '@/stores/UserStore.js';

export const useWebSocketStore = defineStore('webSocket', ws => {
    const stompClient = ref(null);  // WebSocket Client 상태
    const isConnected = ref(false); // 연결 여부
    const receivedMessages = ref([]);   // 수신된 메시지 목록

    // WebSocket 연결 서버 URL
    const socketUrl = window.location.protocol === 'https:'
        ? 'https://localhost:8253/ws'
        : 'http://localhost:8253/ws';

    /* 1. WebSocket 연결 함수 */
    function connectWebSocket() {
        // console.log('connectWebsocket 작동');

        const authStore = useUserStore();
        const token = authStore.accessToken;

        if (!token) {
            console.error('Access token is missing');
            return;
        }
        // console.log("token 설정 완")
        // STOMP Client 설정
        stompClient.value = new Client({
            webSocketFactory: () => new SockJS(socketUrl), // WebSocket 팩토리 함수
            connectHeaders: {
                Authorization: `Bearer ${token}`, // 인증 헤더
            },
            reconnectDelay: 5000, // 재연결 간격 (5초)
            heartbeatIncoming: 4000, // 서버에서 클라이언트로의 heartbeat (4초)
            heartbeatOutgoing: 4000, // 클라이언트에서 서버로의 heartbeat (4초)
        });

        // 연결 성공 시 콜백
        stompClient.value.onConnect = (frame) => {
            // console.log('WebSocket 연결 성공:', frame);
            isConnected.value = true;
        };

        // 연결 실패 또는 종료 시 콜백
        stompClient.value.onDisconnect = () => {
            // console.log('WebSocket 연결 종료');
            isConnected.value = false;
        };

        stompClient.value.onStompError = (frame) => {
            // console.error('STOMP 에러:', frame.headers['message']);
            // console.error('추가 정보:', frame.body);

            alert('WebSocket 연결 중 문제가 발생했습니다.');
        };

        stompClient.value.activate(); // WebSocket 연결 활성화
    }

    /* 2. WebSocket 연결 종료 함수 */
    function disconnectWebSocket() {
        if (stompClient.value) {
            stompClient.value.deactivate();
            isConnected.value = false;
            // console.log('웹소켓 연결 종료');
        }
    }

    // 채팅방 구독 저장 객체
    const subscriptions = ref({});

    /* 3. 채팅방 구독 함수 */
    function subscribeChatroom(chatroomSeq) {
        if(!stompClient.value || !isConnected.value) {
            console.error('WebSocket이 연결되지 않았습니다.');
        }

        const subscription = stompClient.value.subscribe(
            `/sub/${chatroomSeq}`,
            (message) => {
                const receivedMessage = JSON.parse(message.body);
                receivedMessages.value.push(receivedMessage);

                // 오래된 메시지 제거 (최대 100개 유지)
                if (receivedMessages.value.length > 100) {
                    receivedMessages.value.shift();
                }

                // console.log(`채팅방 ${chatroomSeq}의 새 메시지: `, receivedMessage);
            }
        );

        subscriptions.value[chatroomSeq] = subscription; // 구독 객체 저장
        // console.log(`채팅방 ${chatroomSeq}을 구독했습니다.`);
    }


    return {
        stompClient,
        isConnected,
        receivedMessages,
        connectWebSocket,
        disconnectWebSocket,
        subscribeChatroom
    };
});