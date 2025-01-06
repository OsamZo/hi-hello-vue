import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {EventSourcePolyfill} from 'event-source-polyfill'
import {useUserStore} from "@/stores/UserStore.js";
import {fetchName} from "@/services/UserApi.js";

export const useSSEStore = defineStore('sse', () => {
    const notifications = ref([])
    const connectionStatus = ref('disconnected')
    let eventSource = null
    let userStore = null;

    // 알림 권한 요청
    const requestNotificationPermission = async () => {
        try {
            const permission = await Notification.requestPermission()
            // console.log('알림 권한:', permission)
            return permission === 'granted'
        } catch (error) {
            // console.error('알림 권한 요청 실패:', error)
            return false
        }
    }

    // 브라우저 알림 표시
    const showBrowserNotification = (data) => {
        if (Notification.permission === 'granted') {
            const notification = new Notification('새로운 알림', {
                body: data.notiContent,
                tag: data.notiSeq,
            })

            // 알림 클릭 시 해당 페이지로 이동
            notification.onclick = () => {
                window.focus()
                if (data.notiUrl) {
                    data.alramReadStatus = true;
                    window.location.href = data.notiUrl
                }
            }
        }
    }

    const connectSSE = async () => {

        if (connectionStatus.value === 'connecting' || connectionStatus.value === 'connected') {
            // console.log('이미 SSE가 연결중이거나 연결된 상태입니다.')
            return
        }

        connectionStatus.value = 'connecting'
        // console.log('SSE 연결 시도')

        // 알림 권한 요청
        await requestNotificationPermission()

        try {
            // 토큰 유효성 검사를 위해 간단한 API 요청
            // 이 요청은 apiClient의 인터셉터를 통해 처리되므로
            // 토큰이 만료되었다면 자동으로 갱신됨
            userStore = useUserStore();
            const employeeSeq = userStore.getEmployeeInfo().employeeSeq;
            await fetchName(employeeSeq);

            const options = {
                headers: {
                    'Authorization': `Bearer ${userStore.accessToken}`
                },
                withCredentials: true,
                heartbeatTimeout: 3600000
            }

            const baseUrl = import.meta.env.VITE_API_BASE_URL;
            eventSource = new EventSourcePolyfill(`${baseUrl}/notify/connect`, options)

            eventSource.onopen = () => {
                // console.log('SSE 연결 성공')
                connectionStatus.value = 'connected'
            }

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // console.log(data);
                    if (data.notiType) {
                        notifications.value.push(data)
                        showBrowserNotification(data)
                    }
                } catch (error) {
                    // console.error('메시지 파싱 에러:', error)
                }
            }

            eventSource.onerror = (error) => {
                // console.error('SSE 에러:', error)
                connectionStatus.value = 'error'
                if (eventSource) {
                    eventSource.close()
                    setTimeout(connectSSE, 5000)
                }
            }

        } catch (error) {
            // console.error('SSE 연결 실패:', error)
            connectionStatus.value = 'error'
            setTimeout(connectSSE, 5000)
        }
    }

    const disconnectSSE = () => {
        if (eventSource) {
            eventSource.close()
            eventSource = null
        }
        connectionStatus.value = 'disconnected'
        notifications.value = []
    }

    const isConnected = computed(() => connectionStatus.value === 'connected')

    return {
        notifications,
        connectionStatus,
        connectSSE,
        disconnectSSE,
        isConnected
    }
})