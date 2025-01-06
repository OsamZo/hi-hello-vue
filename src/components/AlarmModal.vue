<script setup>
import {ref, onMounted, computed} from 'vue';
import {deleteNoti, getAlarmList, readNoti} from "@/services/AlramApi.js";
import {springAPI} from "@/services/axios.js";
import {useUserStore} from "@/stores/UserStore.js";
import router from "@/router/index.js";
import {useNotificationStore} from "@/stores/NotificationStore.js";

const alarms = ref(null);
const notificationStore = useNotificationStore();

const fetchAlarmList = async () => {
  try {
    const response = await getAlarmList();
    if (response.data.data.length === 0) {
      alarms.value = null;
    } else {
      alarms.value = response.data.data;
    }
  } catch (error) {
    console.error('알람을 조회하는 중 오류 발생', error);
    alarms.value = null;
  }
};

const isReadStatus = async (notiSeq) => {
  try {
    await readNoti(notiSeq);
    // API 호출이 성공하면 프론트엔드 상태 업데이트
    alarms.value = alarms.value.map(alarm => {
      if (alarm.notiSeq === notiSeq) {
        return { ...alarm, alarmReadStatus: true };
      }
      return alarm;
    });
    await notificationStore.updateNotiCount();
  } catch (error) {
    console.error('알람 읽음 처리 중 오류 발생', error);
  }
};

const handleAlarmClick = async (alarm) => {
  try {
    if (!alarm.alarmReadStatus) {
      await isReadStatus(alarm.notiSeq);
    }
    // URL이 있는 경우에만 이동
    if (alarm.notiUrl) {
      await router.push(alarm.notiUrl);
    }
  } catch (error) {
    console.error('알람 처리 중 오류 발생', error);
  }
};

const deleteAlarm = async (notiSeq) => {
  try {
    await deleteNoti(notiSeq);
    // API 호출이 성공하면 해당 알람을 목록에서 제거
    alarms.value = alarms.value.filter(alarm => alarm.notiSeq !== notiSeq);
  } catch (error) {
    console.error('알람 삭제 중 오류 발생', error);
  }
};


onMounted(() => {
  const userStore = useUserStore();
  springAPI.defaults.headers.common['Authorization'] = `Bearer ${userStore.accessToken}`;
  fetchAlarmList();
});
</script>

<template>
  <div class="alarm-list">
    <div class="alarm-list-header">알림</div>

    <div v-if="alarms === null" class="no-alarms">
      새로운 알림이 없습니다.
    </div>

    <div v-else class="alarm-list-section">
      <div
          v-for="item in alarms"
          class="alarm-list-row"
          :class="{ 'unread': !item.alarmReadStatus }"
      >
        <div class="alarm-content" @click="handleAlarmClick(item)">
          <span class="alarm-description">{{ item.notiContent }}</span>
          <span class="alarm-time">{{ item.regDate }}</span>
        </div>
        <div class="alarm-actions">
          <i class="fa-solid fa-check btn-read"
             v-if="!item.alarmReadStatus"
             @click="isReadStatus(item.notiSeq)"/>
          <i class="fa-solid fa-xmark btn-delete"
             @click="deleteAlarm(item.notiSeq)"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alarm-list {
  background-color: var(--white);
  border-radius: 8px;
  width: 380px;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.alarm-list-header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--white);
  flex-shrink: 0; /* 헤더는 크기 고정 */
}

.alarm-list-section {
  flex: 1; /* 남은 공간을 모두 차지 */
  overflow-y: auto; /* 스크롤 활성화 */
}

.alarm-list-section::-webkit-scrollbar {
  width: 6px;
}

.alarm-list-section::-webkit-scrollbar-thumb {
  background-color: var(--gray);
  border-radius: 3px;
}

.alarm-list-section::-webkit-scrollbar-track {
  background-color: var(--light-gray);
}

.no-alarms {
  text-align: center;
  color: var(--light-gray);
  padding: 20px;
}

.alarm-list-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--gray);
  min-height: 30px; /* 각 알람 아이템의 최소 높이 설정 */

}

.alarm-list-row.unread {
  background-color: var(--light-gray);
}

.alarm-list-row:last-child {
  border-bottom: none;
}

.alarm-content {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.alarm-description {
  color: var(--black);
  font-size: 14px;
  margin-bottom: 4px;
  margin-right: 10px;
}

.alarm-time {
  color: var(--gray);
  font-size: 12px;
}

.alarm-actions {
  display: flex;
  gap: 8px;
}

.btn-read, .btn-delete {
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-read {
  background-color: var(--purple);
  color: white;
}

.btn-delete {
  background-color: var(--red);
  color: white;
}
</style>