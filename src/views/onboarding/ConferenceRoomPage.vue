<script setup>
import { ref, onMounted  } from 'vue';
import { useRouter } from 'vue-router';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import '@/styles/onboarding/OnboardingConferenceRoom.css'

import {springAPI} from "@/services/axios.js";
const router = useRouter();

const goToMainPage = async () => {
  const templateSeq = router.currentRoute.value.query.templateSeq; // 쿼리 스트링에서 templateSeq 가져오기

  if (!templateSeq) {
    alert("유효하지 않은 templateSeq입니다.");
    return;
  }
  try {
    // PUT 요청
    await springAPI.put(
        `mentee/onboarding/template/${templateSeq}/status`,
        {}, // 요청 본문이 필요 없다면 빈 객체
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // 로컬스토리지에서 토큰 가져오기
            'Content-Type': 'application/json',
          },
        }
    );

    alert("회의실 예약 실습이 완료되었습니다!");
    await router.push('/'); // 메인 페이지로 이동
  } catch (error) {
    console.error("서버 요청 중 오류 발생:", error.response || error.message);
    alert("서버 요청 중 문제가 발생했습니다. 다시 시도해 주세요.");
  }
};


const selectedDate = ref(null);

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const initFlatpickr = (el) => {
  flatpickr(el, {
    mode: "single",
    onChange: (selectedDates) => {
      selectedDate.value = selectedDates[0] || null;
    //   console.log('Selected Date:', selectedDate.value);
    }
  });
};


const randomDisabled = ref([]); // 랜덤으로 비활성화된 칸을 저장할 배열

// 페이지 로드시 3개의 랜덤 칸을 비활성화 영역으로 설정
onMounted(() => {
  while (randomDisabled.value.length < 9) {
    const roomIndex = Math.floor(Math.random() * rooms.value.length);
    const startTimeSlotIndex = Math.floor(Math.random() * (timeSlots.length - 2)); // 3칸을 비활성화하기 위해 끝에서 2칸을 제외한 범위에서 시작 인덱스 선택

    // 연속된 3개의 시간대를 비활성화할 키 생성
    const disabledKeys = [
      `${roomIndex}-${startTimeSlotIndex}`,
      `${roomIndex}-${startTimeSlotIndex + 1}`,
      `${roomIndex}-${startTimeSlotIndex + 2}`
    ];

    // 랜덤 비활성화 칸이 중복되지 않도록 체크
    if (!disabledKeys.some(key => randomDisabled.value.includes(key))) {
      randomDisabled.value.push(...disabledKeys);
    }
  }
});

const rooms = ref([
  { name: '회의실 1 (6석)', schedule: Array(26).fill('available') },
  { name: '회의실 2 (6석)', schedule: Array(26).fill('available') },
  { name: '회의실 3 (6석)', schedule: Array(26).fill('available') },
  { name: '회의실 4 (6석)', schedule: Array(26).fill('available') },
  { name: '회의실 5 (6석)', schedule: Array(26).fill('available') },
  { name: '회의실 6 (12석)', schedule: Array(26).fill('available') },
  { name: '회의실 7 (12석)', schedule: Array(26).fill('available') },
  { name: '회의실 8 (12석)', schedule: Array(26).fill('available') },
  { name: '회의실 9 (12석)', schedule: Array(26).fill('available') },
  { name: '회의실 10 (12석)', schedule: Array(26).fill('available') }
]);

const timeSlots = Array.from({ length: 26 }, (_, index) => {
  const hour = Math.floor(7 + index / 2);
  const minute = index % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${minute}`;
});

// 드래그 상태 추적
let dragStartIndex = null;
let dragEndIndex = null;
let isDragging = false;

const selectedRange = ref([]); // [startIndex, endIndex] 형식으로 저장

const startDrag = (roomIndex, timeSlotIndex) => {
  if (isDisabled(roomIndex, timeSlotIndex)) {
    return; // 비활성화된 영역에서는 드래그 시작하지 않음
  }
  dragStartIndex = timeSlotIndex;
  isDragging = true;
  selectedRange.value = [dragStartIndex, dragStartIndex]; // 드래그 시작 시 선택 영역 초기화
};

const dragOver = (roomIndex, timeSlotIndex) => {
  if (isDragging && !isDisabled(roomIndex, timeSlotIndex)) {
    dragEndIndex = timeSlotIndex;
    selectedRange.value = [Math.min(dragStartIndex, dragEndIndex), Math.max(dragStartIndex, dragEndIndex)]; // 선택 영역 업데이트
  }
};

const endDrag = (roomIndex) => {
  if (isDragging && dragStartIndex !== null && dragEndIndex !== null) {
    if (checkForConflicts(roomIndex, dragStartIndex, dragEndIndex)) {
      alert("이 시간대에는 이미 예약이 존재합니다.");
      return; // 중복 예약 방지
    }
    updateReservation(roomIndex, dragStartIndex, dragEndIndex);
  }
  isDragging = false; // 드래그 끝나면 상태 초기화
  dragStartIndex = null;
  dragEndIndex = null;
  selectedRange.value = []; // 선택 영역 초기화
};

// 선택된 영역을 비활성화하는 함수
const isDisabled = (roomIndex, index) => {
  // 첫 번째 열과 두 번째 열을 비활성화
  if (index === 0 || index === 1) {
    return 'fixed-disabled'; // 고정 비활성화 열
  }
  // 랜덤으로 비활성화된 칸을 확인
  if (randomDisabled.value.includes(`${roomIndex}-${index}`)) {
    return 'random-disabled'; // 랜덤 비활성화된 버튼
  }
  return false; // 비활성화되지 않음
};

function isSequentialDisabled(roomIndex, timeSlotIndex) {
  return (
      randomDisabled.value.includes(`${roomIndex}-${timeSlotIndex}`) ||
      randomDisabled.value.includes(`${roomIndex}-${timeSlotIndex + 1}`) ||
      randomDisabled.value.includes(`${roomIndex}-${timeSlotIndex + 2}`)
  );
}

// 시간대에 예약이 중복되는지 확인하는 함수
const checkForConflicts = (roomIndex, startIndex, endIndex) => {
  for (let i = startIndex; i <= endIndex; i++) {
    for (let room of rooms.value) {
      if (room !== rooms.value[roomIndex] && room.schedule[i] === 'reserved') {
        return true;
      }
    }
  }
  return false;
};

const updateReservation = (roomIndex, startIndex, endIndex) => {
  const room = rooms.value[roomIndex];
  const start = Math.min(startIndex, endIndex);
  const end = Math.max(startIndex, endIndex);

  for (let i = start; i <= end; i++) {
    room.schedule[i] = room.schedule[i] === 'available' ? 'reserved' : 'available';
  }
  // console.log(`Reservation updated for room ${room.name} from ${start} to ${end}`);
};

</script>


<template>
  <div class="conferenceRoomPageContainer">
    <div class="conferenceRoomPageHeader">
      <div class="conferenceRoomPageHeaderTitle">
        회의실 예약
      </div>
    </div>
    <div class="conferenceRoomPageBody">
      <div class="conferenceRoomPageBody-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar3" viewBox="0 0 16 16">
          <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857z"/>
          <path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
        </svg>
        <div class="conferenceRoomPageBody-date">
          날짜 :
        </div>
        <input
            ref="calendar"
            type="text"
            placeholder="날짜를 선택하세요"
            @focus="initFlatpickr($refs.calendar)"
            class="calendar-input-box"
        />
      </div>

      <div class="conferenceRoomPageBody-select-container">
        <!-- 예약 테이블 -->
        <table class="conferenceRoomPageBody-table">
          <thead class="cf_thead">
          <tr class="conferenceRoomPageBody-table-header">
            <th rowspan="2" class="floor-cell-first"></th>
            <th colspan="2" class="floor-cell-zero"></th>
            <td
                v-for="(timeSlot, index) in timeSlots"
                :key="index"
                class="conferenceRoomPageBody-time-header"
            >
              {{ timeSlot.split(':')[0] }}
            </td>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td rowspan="5" class="floor-cell">5층</td> <!-- 5층 -->
            <td class="conferenceRoomPageBody-room-cell">{{ rooms[0].name }}</td>
            <td
                v-for="(timeSlot, index) in timeSlots"
                :key="index"
                class="conferenceRoomPageBody-button-cell"
                @mousedown="startDrag(0, index)"
                @mousemove="dragOver(0, index)"
                @mouseup="endDrag(0)"
            >
              <button
                  :class="{
                      available: rooms[0].schedule[index] === 'available' && !isDisabled(0, index),
                    reserved: rooms[0].schedule[index] === 'reserved',
                    disabled: isDisabled(0, index),
                    'fixed-disabled': isDisabled(0, index) === 'fixed-disabled',  /* 고정 비활성화 */
                    'random-disabled': isDisabled(0, index) === 'random-disabled'  /* 랜덤 비활성화 */
                    }"
                  class="conferenceRoomPageBody-button"
                  :disabled="isDisabled(0, index)"
              ></button>
            </td>
          </tr>
          <tr>
            <td class="conferenceRoomPageBody-room-cell">{{ rooms[1].name }}</td>
            <td
                v-for="(timeSlot, index) in timeSlots"
                :key="index"
                class="conferenceRoomPageBody-button-cell"
                @mousedown="startDrag(1, index)"
                @mousemove="dragOver(1, index)"
                @mouseup="endDrag(1)"
            >
              <button
                  :class="{
                    available: rooms[1].schedule[index] === 'available' && !isDisabled(1, index),
                    reserved: rooms[1].schedule[index] === 'reserved',
                    disabled: isDisabled(1, index),
                    'fixed-disabled': isDisabled(1, index) === 'fixed-disabled',  /* 고정 비활성화 */
                    'random-disabled': isDisabled(1, index) === 'random-disabled'  /* 랜덤 비활성화 */
                  }"
                  class="conferenceRoomPageBody-button"
              ></button>
            </td>
          </tr>
          <tr>
            <td class="conferenceRoomPageBody-room-cell">{{ rooms[2].name }}</td>
            <td
                v-for="(timeSlot, index) in timeSlots"
                :key="index"
                class="conferenceRoomPageBody-button-cell"
                @mousedown="startDrag(2, index)"
                @mousemove="dragOver(2, index)"
                @mouseup="endDrag(2)"
            >
              <button
                  :class="{
                    available: rooms[2].schedule[index] === 'available' && !isDisabled(2, index),
                    reserved: rooms[2].schedule[index] === 'reserved',
                    disabled: isDisabled(2, index),
                    'fixed-disabled': isDisabled(2, index) === 'fixed-disabled',  /* 고정 비활성화 */
                    'random-disabled': isDisabled(2, index) === 'random-disabled'  /* 랜덤 비활성화 */
                  }"
                  class="conferenceRoomPageBody-button"
                  :disabled="isDisabled(2, index)"
              ></button>
            </td>
          </tr>
          <tr>
            <td class="conferenceRoomPageBody-room-cell">{{ rooms[3].name }}</td>
            <td
                v-for="(timeSlot, index) in timeSlots"
                :key="index"
                class="conferenceRoomPageBody-button-cell"
                @mousedown="startDrag(3, index)"
                @mousemove="dragOver(3, index)"
                @mouseup="endDrag(3)"
            >
              <button
                  :class="{
                    available: rooms[3].schedule[index] === 'available' && !isDisabled(3, index),
                    reserved: rooms[3].schedule[index] === 'reserved',
                    disabled: isDisabled(3, index),
                    'fixed-disabled': isDisabled(3, index) === 'fixed-disabled',  /* 고정 비활성화 */
                    'random-disabled': isDisabled(3, index) === 'random-disabled'  /* 랜덤 비활성화 */
                  }"
                  class="conferenceRoomPageBody-button"
                  :disabled="isDisabled(3, index)"
              ></button>
            </td>
          </tr>
          <tr>
            <td class="conferenceRoomPageBody-room-cell">{{ rooms[4].name }}</td>
            <td
                v-for="(timeSlot, index) in timeSlots"
                :key="index"
                class="conferenceRoomPageBody-button-cell"
                @mousedown="startDrag(4, index)"
                @mousemove="dragOver(4, index)"
                @mouseup="endDrag(4)"
            >
              <button
                  :class="{
                    available: rooms[4].schedule[index] === 'available' && !isDisabled(4, index),
                    reserved: rooms[4].schedule[index] === 'reserved',
                    disabled: isDisabled(4, index),
                    'fixed-disabled': isDisabled(4, index) === 'fixed-disabled',  /* 고정 비활성화 */
                    'random-disabled': isDisabled(4, index) === 'random-disabled'  /* 랜덤 비활성화 */
                  }"
                  class="conferenceRoomPageBody-button"
                  :disabled="isDisabled(4, index)"
              ></button>
            </td>
          </tr>

          <!-- 6층 예약 행 -->
          <tr>
            <td rowspan="5" class="floor-cell">6층</td> <!-- 6층 -->
            <td class="conferenceRoomPageBody-room-cell">{{ rooms[5].name }}</td>
            <td
                v-for="(timeSlot, index) in timeSlots"
                :key="index"
                class="conferenceRoomPageBody-button-cell"
                @mousedown="startDrag(5, index)"
                @mousemove="dragOver(5, index)"
                @mouseup="endDrag(5)"
            >
              <button
                  :class="{
                    available: rooms[5].schedule[index] === 'available' && !isDisabled(5, index),
                    reserved: rooms[5].schedule[index] === 'reserved',
                    disabled: isDisabled(5, index),
                    'fixed-disabled': isDisabled(5, index) === 'fixed-disabled',  /* 고정 비활성화 */
                    'random-disabled': isDisabled(5, index) === 'random-disabled'  /* 랜덤 비활성화 */
                  }"
                  class="conferenceRoomPageBody-button"
                  :disabled="isDisabled(5, index)"
              ></button>
            </td>
          </tr>
          <tr>
            <td class="conferenceRoomPageBody-room-cell">{{ rooms[6].name }}</td>
            <td
                v-for="(timeSlot, index) in timeSlots"
                :key="index"
                class="conferenceRoomPageBody-button-cell"
                @mousedown="startDrag(6, index)"
                @mousemove="dragOver(6, index)"
                @mouseup="endDrag(6)"
            >
              <button
                  :class="{
                    available: rooms[6].schedule[index] === 'available' && !isDisabled(6, index),
                    reserved: rooms[6].schedule[index] === 'reserved',
                    disabled: isDisabled(6, index),
                    'fixed-disabled': isDisabled(6, index) === 'fixed-disabled',  /* 고정 비활성화 */
                    'random-disabled': isDisabled(6, index) === 'random-disabled'  /* 랜덤 비활성화 */
                  }"
                  class="conferenceRoomPageBody-button"
                  :disabled="isDisabled(6, index)"
              ></button>
            </td>
          </tr>
          <tr>
            <td class="conferenceRoomPageBody-room-cell">{{ rooms[7].name }}</td>
            <td
                v-for="(timeSlot, index) in timeSlots"
                :key="index"
                class="conferenceRoomPageBody-button-cell"
                @mousedown="startDrag(7, index)"
                @mousemove="dragOver(7, index)"
                @mouseup="endDrag(7)"
            >
              <button
                  :class="{
                    available: rooms[7].schedule[index] === 'available' && !isDisabled(7, index),
                    reserved: rooms[7].schedule[index] === 'reserved',
                    disabled: isDisabled(7, index),
                    'fixed-disabled': isDisabled(7, index) === 'fixed-disabled',  /* 고정 비활성화 */
                    'random-disabled': isDisabled(7, index) === 'random-disabled'  /* 랜덤 비활성화 */
                  }"
                  class="conferenceRoomPageBody-button"
                  :disabled="isDisabled(7, index)"
              ></button>
            </td>
          </tr>
          <tr>
            <td class="conferenceRoomPageBody-room-cell">{{ rooms[8].name }}</td>
            <td
                v-for="(timeSlot, index) in timeSlots"
                :key="index"
                class="conferenceRoomPageBody-button-cell"
                @mousedown="startDrag(8, index)"
                @mousemove="dragOver(8, index)"
                @mouseup="endDrag(8)"
            >
              <button
                  :class="{
                    available: rooms[8].schedule[index] === 'available' && !isDisabled(8, index),
                    reserved: rooms[8].schedule[index] === 'reserved',
                    disabled: isDisabled(8, index),
                    'fixed-disabled': isDisabled(8, index) === 'fixed-disabled',  /* 고정 비활성화 */
                    'random-disabled': isDisabled(8, index) === 'random-disabled'  /* 랜덤 비활성화 */
                  }"
                  class="conferenceRoomPageBody-button"
                  :disabled="isDisabled(8, index)"
              ></button>
            </td>
          </tr>
          <tr>
            <td class="conferenceRoomPageBody-room-cell">{{ rooms[9].name }}</td>
            <td
                v-for="(timeSlot, index) in timeSlots"
                :key="index"
                class="conferenceRoomPageBody-button-cell"
                @mousedown="startDrag(9, index)"
                @mousemove="dragOver(9, index)"
                @mouseup="endDrag(9)"
            >
              <button
                  :class="{
                    available: rooms[9].schedule[index] === 'available' && !isDisabled(9, index),
                    reserved: rooms[9].schedule[index] === 'reserved',
                    disabled: isDisabled(9, index),
                    'fixed-disabled': isDisabled(9, index) === 'fixed-disabled',  /* 고정 비활성화 */
                    'random-disabled': isDisabled(9, index) === 'random-disabled'  /* 랜덤 비활성화 */
                  }"
                  class="conferenceRoomPageBody-button"
                  :disabled="isDisabled(9, index)"
              ></button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <div class="color-box-container">
        <div class="color-box">
          <div class="color-box-gray"/>
          예약 불가
        </div>
        <div class="color-box">
          <div class="color-box-white"/>
          예약 가능
        </div>
      </div>
      <div class="reserveButton-container">
        <button class="reserveButton" @click="goToMainPage">
          예약하기
        </button>
      </div>
    </div>
  </div>
</template>


<style scoped>

</style>