<script setup>
import {computed, onMounted, reactive, ref} from 'vue';
import {useRouter} from 'vue-router';
import {springAPI} from '@/services/axios.js';
import '@/styles/user/MenteeOnboardingPage.css';
import {
  changeCompleteStatusByMentee,
  changeCompleteStatusByMentor,
  fetchChecklistStatus
} from "@/services/OnBoardingAPI.js";
import {useUserStore} from "@/stores/UserStore.js";
import {downloadFile} from "@/services/FileApi.js";

const router = useRouter();
const userStore = useUserStore();
const employeeInfo = userStore.getEmployeeInfo();
const employeeRole = employeeInfo.employeeRole[0];
const modalLoading = ref(false); // 모달 로딩 상태

// 상태 변수 정의
const onboardingList = ref([]); // 온보딩 리스트 데이터
const loading = ref(true); // 로딩 상태
const query = ref('example'); // query 값
const completedCount = ref(0); // 완료된 항목의 개수
const totalCount = ref(0); // 전체 항목의 개수
const isModalOpen = ref(false); // 모달 열림 여부
const selectedItem = ref(null); // 선택된 항목 저장
const templateType = ref('VIDEO');
// 온보딩 박스 및 선 연결 관련 상태 변수 정의
const boxPositions = reactive([]);  // 카드의 위치 정보를 담는 객체
const lines = ref([]);
const canvas = ref(null);
let draggingCard = null;
let offsetX = 0;
let offsetY = 0;

// 체크리스트 상태 업데이트
const updateChecklistStatus = async (checklistStatusSeq, checklistSeq, listCheckedStatus) => {
  try {
    const payload = {
      checklistStatusSeq,
      checklistSeq,
      listCheckedStatus,
    };

    const response = await springAPI.put('/onboarding/checklist', payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    // if (response.data.success) {
    //   console.log('체크리스트 상태 업데이트 성공:', response.data.message);
    // } else {
    //   console.error('체크리스트 상태 업데이트 실패:', response.data.message);
    // }
  } catch (error) {
    console.error('API 호출 에러:', error);
  }
};

// 온보딩 데이터 가져오기
const fetchOnboardingData = async () => {
  try {
    let response;
    if (employeeRole === 'MENTEE') {
      response = await springAPI.get('mentee/onboarding', {
        params: {taskContent: query.value}
      });
    } else if (employeeRole === 'MENTOR') {
      response = await springAPI.get('mentor/onboarding', {
        params: {taskContent: query.value}
      });
    }

    if (response.data.success) {
      onboardingList.value = groupChecklistByTemplate(response.data.data.onboardingList);

      // 완료된 항목과 전체 항목의 개수 계산
      completedCount.value = onboardingList.value.filter(
          (item) => item.onboardingCompletedStatus
      ).length;
      totalCount.value = onboardingList.value.length;

    } else {
      console.error('데이터 호출 실패:', response.data.message);
    }
  } catch (error) {
    console.error('API 호출 에러:', error);
  } finally {
    loading.value = false;
  }
};

// 모달 열기/닫기
const openModal = (item) => {
  selectedItem.value = {
    taskSeq: item.taskSeq,
    taskGroupSeq: item.taskGroupSeq,
    templateType: item.templateType,
    templateSeq: item.templateSeq,
    templateDetail: item.templateDetail,
    templateUrlName: item.templateUrlName,
    quizCategorySeq: item.quizCategorySeq
  }; // taskSeq와 taskGroupSeq 저장
  modalLoading.value = true; // 로딩 상태 활성화
  isModalOpen.value = true; // 모달 열기
};

const closeModal = () => {
  isModalOpen.value = false; // 모달 닫기
  modalLoading.value = false; // 로딩 상태 비활성화
};

// 페이지 이동
const goToTaskPage = () => {
  if (selectedItem.value) {
    const taskSeq = selectedItem.value.taskSeq;
    const templateSeq = selectedItem.value.templateSeq; // templateSeq 값 추가

    if (!taskSeq) {
      console.error('taskSeq 값이 없습니다.');
      return;
    }
    if (!templateSeq) {
      console.error('templateSeq 값이 없습니다.');
      return;
    }

    // URL로 경로와 쿼리 문자열을 전달
    router.push({
      path: `/task/${taskSeq}`,
      query: { templateSeq }, // templateSeq를 쿼리 파라미터로 추가
    });
  } else {
    console.error('selectedItem 값이 없습니다.');
  }
};
const goToTaskReviewPage = () => {

  if (selectedItem.value) {
    router.push(`/task-submit/${selectedItem.value.taskSeq}`);
  } else {
    console.error('taskSeq 값이 없습니다.');
  }
}

const goToQuiz = () => {
  if (selectedItem.value) {
    router.push(`/quiz/${selectedItem.value.quizCategorySeq}`)
  } else {
    alert("퀴즈 페이지가 유효하지 않습니다.")
  }
}

const goToCF = () => {
  if (selectedItem.value) {
    const templateSeq = selectedItem.value.templateSeq;
    router.push({
      path: `/onboarding/conferenceRoom`,
      query: {templateSeq}
    });
  } else {
    alert("회의실 예약 페이지가 유효하지 않습니다.")
  }
}

const goToBreak = () => {
  if (selectedItem.value) {
    const templateSeq = selectedItem.value.templateSeq;
    router.push({
      path: `/break`,
      query: {templateSeq}
    });
  } else {
    alert("휴가 신청 페이지가 유효하지 않습니다.")
  }
}

const goToGroupEvalPage = () => {
  if (selectedItem.value && selectedItem.value.taskGroupSeq) {
    router.push(`/onboarding/groupEval/${selectedItem.value.taskGroupSeq}`);
  } else {
    console.error('taskGroupSeq 값이 없습니다.');
  }
};

// 체크리스트를 templateSub 기준으로 그룹화
const groupChecklistByTemplate = (onboardingList) => {
  const groupedItems = [];

  onboardingList.forEach((item) => {
    let template = groupedItems.find(
        (group) => group.templateSub === item.templateSub
    );

    if (!template) {
      template = {
        templateSeq: item.templateSeq,
        templateTitle: item.templateTitle,
        templateSub: item.templateSub,
        templateDetail: item.templateDetail,
        templateType: item.templateType,
        checklistContent: [],
        onboardingCompletedStatus: item.onboardingCompletedStatus,
        templateUrlName: item.templateUrlName,
        taskSeq: item.taskSeq,
        taskGroupSeq: item.taskGroupSeq,
        templateCheckRequiredStatus: item.templateCheckRequiredStatus,
        fileSeq: item.fileSeq,
        fileName: item.fileName,
        fileUrl: item.fileUrl,
        quizCategorySeq: item.quizCategorySeq
      };
      groupedItems.push(template);
    }

    if (item.checklistContent) {
      template.checklistContent.push({
        checklistStatusSeq: item.checklistStatusSeq,
        checklistSeq: item.checklistSeq,
        checklistContent: item.checklistContent,
        listCheckedStatus: item.listCheckedStatus,
      });
    }
  });

  return groupedItems;
};

const modalContentStyle = computed(() => {
  // console.log('selectedItem:', selectedItem);
  // console.log('selectedItem.templateType:', selectedItem.value.templateType);

  if (selectedItem && selectedItem.value.templateType === 'VIDEO') {
    return {
      width: '40vw',
      height: 'auto',
    };
  }
  return {
    width: '14vw',
    height: 'auto',
  };
});

const goToUrl = (url) => {
  // console.log('Received URL:', url);
  if (url) {
    window.open(url, '_blank'); // 새 탭에서 열기
  } else {
    console.error('URL is null or undefined.');
  }
};

// 체크리스트 항목 상태 변경
const toggleChecklistStatus = async (item, content) => {
  const updatedStatus = !content.listCheckedStatus; // 상태 반전

  const beforeUpdateChecklistStatus = await fetchChecklistStatus(item.templateSeq, employeeRole);

  await updateChecklistStatus(
      content.checklistStatusSeq,
      content.checklistSeq,
      updatedStatus
  );
  content.listCheckedStatus = updatedStatus; // 상태 변경

  const afterUpdateChecklistStatus = await fetchChecklistStatus(item.templateSeq, employeeRole);
  if (beforeUpdateChecklistStatus.data.data !== afterUpdateChecklistStatus.data.data) {
    await fetchingChecklistStatus(item.templateSeq);
  }
};

// 체크리스트 수행 완료 상태 조회 및 처리
const fetchingChecklistStatus = async (templateSeq) => {
  try {
    await changeCompleteStatus(templateSeq);
  } catch (error) {
    alert("체크리스트 수행 완료 상태를 조회하던 도중 오류가 발생했습니다.");
  }
}

const changeCompleteStatusMentee = async (templateSeq) => {
  await changeCompleteStatusByMentee(templateSeq);
  await fetchOnboardingData();
}

const changeCompleteStatusMentor = async (templateSeq) => {
  await changeCompleteStatusByMentor(templateSeq);
  await fetchOnboardingData();
}

const changeCompleteStatus = async (templateSeq) => {
  if (employeeRole === 'MENTEE') {
    await changeCompleteStatusByMentee(templateSeq);
  } else if (employeeRole === 'MENTOR') {
    await changeCompleteStatusByMentor(templateSeq);
  }

  await fetchOnboardingData();
}

const resetBoxPositions = (index) => {
  const boxWidthGap = 400; // 박스의 가로 간격
  const rowGap = 80;
  const boxes = document.querySelectorAll('.item-box');
  const rowHeights = [];  // 각 행의 최대 높이를 저장

  let cumulativeHeight = 200;

  boxes.forEach((box, index) => {
    const boxHeight = box.getBoundingClientRect().height;
    const row = Math.floor(index / 3); // 3개씩 한 줄로 배치
    const col = index % 3;

    // 현재 행의 최대 높이를 업데이트
    if (!rowHeights[row]) rowHeights[row] = 0;
    rowHeights[row] = Math.max(rowHeights[row], boxHeight);

    const left = row % 2 === 0 ? 210 + col * boxWidthGap : 210 + (2 - col) * boxWidthGap; // 왼쪽 또는 오른쪽으로 배치
    const top = cumulativeHeight; // 세로 방향 간격

    boxPositions.push({top, left});

    if (col === 2 || index === boxes.length - 1) {
      cumulativeHeight += rowHeights[row] + rowGap;
    }
  })

  // 초기화된 boxPositions을 로컬 스토리지에 저장
  localStorage.setItem('boxPositions', JSON.stringify(boxPositions));
}

/* 온보딩 박스 위치 및 선 연결에 관한 메서드들 */
const updateBoxPositions = () => {
  const savedPositions = localStorage.getItem('boxPositions');

  // boxPositions 초기화
  boxPositions.length = 0;

  if (savedPositions) {
    const positions = JSON.parse(savedPositions);

    // 현재 onboardingList와 일치하도록 boxPositions 동기화
    onboardingList.value.forEach((_, index) => {
      if (positions[index]) {
        // 기존 항목 유지
        boxPositions.push(positions[index]);
      } else {
        resetBoxPositions(index);
      }
    });

    // 길이가 줄어든 경우 처리
    if (boxPositions.length > onboardingList.value.length) {
      boxPositions.splice(onboardingList.value.length);
    }

    // 변경된 boxPositions을 로컬 스토리지에 저장
    localStorage.setItem('boxPositions', JSON.stringify(boxPositions));
  } else {
    // 로컬 스토리지에 데이터가 없을 때 초기화
    onboardingList.value.forEach((_, index) => {
      resetBoxPositions(index);
    });
  }
};

const calculatePath = (startCard, endCard) => {
  if (!startCard || !endCard) return '';

  const startRect = startCard.getBoundingClientRect();
  const endRect = endCard.getBoundingClientRect();
  const canvasRect = canvas.value.getBoundingClientRect();
  const canvasScrollLeft = canvas.value.scrollLeft;
  const canvasScrollTop = canvas.value.scrollTop;

  // 시작 점 (박스의 중앙)
  const startX = startRect.left + startRect.width / 2 - canvasRect.left + canvasScrollLeft;
  const startY = startRect.top + startRect.height / 2 - canvasRect.top + canvasScrollTop;

  // 끝 점 (박스의 중앙)
  const endX = endRect.left + endRect.width / 2 - canvasRect.left + canvasScrollLeft;
  const endY = endRect.top + endRect.height / 2 - canvasRect.top + canvasScrollTop;

  // S자 형태의 곡선 커브 세로 방향 크기 조정
  const verticalOffset = 100;  // S자 커브의 세로 방향 크기 조정
  const middleX = (startX + endX) / 2; // 중간 지점 X

  // 시작과 끝 박스의 Y 위치를 기준으로 제어점 위치 계산
  const control1Y = startY < endY ? startY : startY;
  const control2Y = startY < endY ? endY : endY;

  return `M ${startX} ${startY}
          C ${middleX + verticalOffset} ${control1Y} ${middleX - verticalOffset} ${control2Y} ${endX} ${endY}`;
};

const updateLines = (movedIndex) => {
  const linesToUpdate = [];

  if (movedIndex !== undefined) {
    // 이동한 박스 앞선 연결 선 업데이트
    if (movedIndex > 0) {
      const prevCard = document.querySelector(`#item-${movedIndex - 1}`);
      const currentCard = document.querySelector(`#item-${movedIndex}`);
      const path = calculatePath(prevCard, currentCard);
      if (path) {
        linesToUpdate.push({index: movedIndex, d: path});
      }
    }

    // 이동한 박스 뒷선 연결 업데이트
    if (movedIndex < onboardingList.value.length - 1) {
      const prevCard = document.querySelector(`#item-${movedIndex}`);
      const currentCard = document.querySelector(`#item-${movedIndex + 1}`);
      const path = calculatePath(prevCard, currentCard);
      if (path) {
        linesToUpdate.push({index: movedIndex + 1, d: path});
      }
    }

    // 기존 선과 겹치는 선만 갱신
    lines.value = lines.value.filter(line => !linesToUpdate.some(updatedLine => updatedLine.index === line.index));
    lines.value.push(...linesToUpdate);
  } else {
    // 전체 선을 그리는 경우
    lines.value = [];
    onboardingList.value.forEach((_, index) => {
      if (index === 0) return;
      const prevCard = document.querySelector(`#item-${index - 1}`);
      const currentCard = document.querySelector(`#item-${index}`);
      const path = calculatePath(prevCard, currentCard);
      if (path) {
        lines.value.push({index, d: path});
      }
    });
  }
};

const startDrag = (index, event) => {
  const box = document.querySelectorAll('.item-box')[index]; // 박스 DOM 요소 가져오기
  const rect = box.getBoundingClientRect(); // 박스 위치와 크기 가져오기

  offsetX = event.clientX - rect.left;
  offsetY = event.clientY - rect.top;

  draggingCard = index;

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

const onDrag = (event) => {
  if (draggingCard === null) return;
  const canvasRect = canvas.value.getBoundingClientRect();
  const boxWidth = document.querySelector(`#item-${draggingCard}`).offsetWidth;
  const boxHeight = document.querySelector(`#item-${draggingCard}`).offsetHeight;

  // 계산된 위치
  let newLeft = event.clientX - offsetX;
  let newTop = event.clientY - offsetY;

  // canvas 경계 제한
  newLeft = Math.max(canvasRect.left, Math.min(canvasRect.right - boxWidth, newLeft));
  newTop = Math.max(canvasRect.top, Math.min(canvasRect.bottom - boxHeight, newTop));

  // 업데이트된 위치 저장
  boxPositions[draggingCard].left = newLeft - canvasRect.left + canvas.value.scrollLeft;
  boxPositions[draggingCard].top = newTop - canvasRect.top + canvas.value.scrollTop;
  updateLines();
};

const stopDrag = () => {
  draggingCard = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  localStorage.setItem('boxPositions', JSON.stringify(boxPositions));
};

onMounted(async () => {
  await fetchOnboardingData();
  await updateBoxPositions();
  await updateLines();
  window.addEventListener('scroll', updateLines);
});
</script>

<template>
  <div class="onboarding-page">
    <div class="header">
      <div v-if="loading" class="loading">로딩 중...</div>
      <div v-else class="header-box">
        <!-- 완료된 항목을 게이지로 표시 -->
        <div class="status-gauge">
          <div class="vr"></div>
          <div class="status-gauge-container">
            <div>온보딩 수행률</div>
            <div class="wave-container">
              <progress :value="completedCount" :max="totalCount" class="progress-bar"></progress>
              <div class="wave"></div>
            </div>
            <p class="progress-text">{{ completedCount }} of {{ totalCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <div ref="canvas" class="canvas">
      <svg class="line-container">
        <path
            v-for="(line, index) in lines"
            :key="index"
            :d="line.d"
            stroke="var(--purple)"
            stroke-width="5"
            fill="transparent"
            stroke-dasharray="9, 10"
            stroke-linecap="round"
        />
      </svg>
      <div
          v-for="(item, index) in onboardingList"
          :key="index"
          :id="`item-${index}`"
          class="item-box"
          :style="{
                top: boxPositions[index] && boxPositions[index].top ? boxPositions[index].top + 'px' : '0px',
                left: boxPositions[index] && boxPositions[index].left ? boxPositions[index].left + 'px' : '0px'
              }"
          @mousedown="startDrag(index, $event)"
          :class="{
              'first-item': index === 0,
              'last-item': index === onboardingList.length - 1
            }"
      >
        <div class="item-box-inner">
          <div class="item-header">
            <div class="templateTitle">{{ item.templateTitle }}</div>
          </div>
          <div
              class="item-content"
              :class="{ completed: item.onboardingCompletedStatus, 'checklist-item-box-container': item.templateType === 'CHECKLIST'}">
            <div class="templateDetail">{{ item.templateSub }}</div>
            <div v-if="item.templateType === 'CHECKLIST'" class="checklist-bigBox">
              <div
                  v-if="Array.isArray(item.checklistContent) && item.checklistContent.length > 0"
                  class="checklist-container">
                <div class="checklist-content" v-for="(content, index) in item.checklistContent" :key="index">
                  <label class="checklist-label">
                    <input
                        type="checkbox"
                        class="checklist-checkbox"
                        :checked="content.listCheckedStatus"
                        @change="toggleChecklistStatus(item, content) "
                    />
                  </label>
                  <div class="checklist-inner">{{ content.checklistContent }}</div>
                </div>
              </div>
              <div v-else>
                <div class="templateContent">{{ item.checklistContent || '체크리스트 항목이 없습니다.' }}</div>
              </div>
            </div>
            <div v-else>
              <div>
                <button
                    v-if="item.fileName"
                    class="template-download-button"
                    @click="downloadFile(item.fileUrl, item.fileName)">
                  🔗{{ item.fileName }}
                </button>
                <button class="template-button template-confirm-button" @click="openModal(item)">
                  확인하기
                </button>
                <button
                    v-if="(item.templateCheckRequiredStatus === true && employeeRole === 'MENTOR' || item.templateCheckRequiredStatus === false && employeeRole === 'MENTEE') && !(item.templateType === 'TASK' || item.templateType === 'BREAK' || item.templateType === 'CF')"
                    class="template-button template-complete-button"
                    @click="employeeRole === 'MENTOR' ? changeCompleteStatusMentor(item.templateSeq) : changeCompleteStatusMentee(item.templateSeq)">
                  완료하기
                </button>

                <div v-if="isModalOpen" class="modal">
                  <div class="modal-content" :style="modalContentStyle">
                    <div v-if="selectedItem?.templateType === 'VIDEO'" class="video-modal">
                      <h2>{{ selectedItem?.templateTitle }}</h2>

                      <!-- Spinner -->
                      <div v-if="modalLoading" class="loading-spinner">
                        <div class="spinner"></div>
                        <p>로딩중...</p>
                      </div>

                      <iframe
                          v-show="!modalLoading"
                          class="iframe-main-page"
                          @load="modalLoading = false"
                          width="560"
                          height="315"
                          :src="`https://www.youtube.com/embed/${selectedItem.templateUrlName}`"
                          title="YouTube video player"
                          frameborder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen
                      ></iframe>
                      <button @click="closeModal" class="close-button">닫기</button>
                    </div>
                    <div v-else>
                      <p>{{ selectedItem.templateDetail }}</p>
                      <div class="onboarding-button-container">
                        <button
                            v-if="selectedItem && selectedItem.taskSeq !== null"
                            @click="employeeRole === 'MENTOR' ? goToTaskReviewPage(selectedItem) : goToTaskPage(selectedItem)"
                            class="check-task-button"
                        >
                          과제확인
                        </button>
                        <button
                            v-if="selectedItem.taskGroupSeq !== null"
                            @click="goToGroupEvalPage"
                            class="cw-eval-button"
                        >
                          동료평가
                        </button>
                        <button
                            v-if="selectedItem.templateType === 'QUIZ'"
                            @click="goToQuiz(selectedItem.quizCategorySeq)"
                            class="go-to-quiz-button"
                        >
                          퀴즈
                        </button>
                        <button
                            v-if="selectedItem.templateType === 'CF'"
                            @click="goToCF"
                            class="go-to-CF-button"
                        >
                          회의실 예약
                        </button>
                        <button
                            v-if="selectedItem.templateType === 'BREAK'"
                            @click="goToBreak"
                            class="go-to-Break-button"
                        >
                          휴가 신청
                        </button>
                        <button @click="closeModal" class="close-button">닫기</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bar2"/>
  </div>
</template>