<template>
  <div class="aside-wrapper">
    <aside class="aside-menu" @click.stop>
      <!-- 로고 클릭 시 /main으로 이동 -->
      <div class="logo">
        <router-link to="/main" class="logo-style">HiHello</router-link>
      </div>

      <!-- 메뉴 -->
      <ul class="aside-menu-list">
        <!-- 이름 조회 -->
        <div>
          <li class="aside-login-name">
            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-person"
                 viewBox="0 0 16 16">
              <path
                  d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
            </svg>
            <span class="login-name" @click.stop="openProfileModal">{{ employeeName }} 님</span>
            <div class="notify-box" @click.stop="openAlarmModal">
              <i class="notify fa-solid fa-bell"/>
              <div class="notify-count" v-if="notificationStore.notiCount !== 0">{{ notificationStore.notiCount }}</div>
            </div>
          </li>
        </div>

        <!-- 로그아웃 메뉴 -->
        <li class="aside-logout-button" @click="logout">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
               class="bi bi-box-arrow-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd"
                  d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
            <path fill-rule="evenodd"
                  d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
          </svg>
          로그아웃
        </li>

        <!-- 메뉴 리스트 -->
        <li v-for="menu in filteredMenus" :key="menu.name" class="menu-item">
          <!-- 상위 메뉴 -->
          <div
              :class="{ active: activeMenu === menu.name || (menu.subMenus && menu.subMenus.some(sub => activeSubMenu === sub.name)) }"
              @click="toggleMenu(menu.name)"
          >
            <router-link v-if="menu.url" :to="menu.url">
              {{ menu.name }}
            </router-link>
            <span v-else>
            {{ menu.name }}
          </span>
          </div>

          <!-- 서브 메뉴 -->
          <ul v-if="menu.subMenus && activeMenu === menu.name" class="sub-menu">
            <li
                v-for="subMenu in menu.subMenus"
                :key="subMenu.name"
                class="sub-menu-item"
                :class="{ active: activeSubMenu === subMenu.name }"
                @click.stop="activateSubMenu(subMenu.name)"
            >
              <router-link :to="subMenu.url">
                {{ subMenu.name }}
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </aside>
    <AlarmModal class="alarm-modal" v-if="shouldShowAlarms" @click.stop/>
    <EmployeeProfile class="profile-modal" v-if="shouldShowProfile" @click.stop @change-view="handleViewChange"/>
  </div>
</template>

<script setup>
import {computed, nextTick, onMounted, ref} from "vue";
import {useUserStore} from "@/stores/UserStore.js";
import router from "@/router/index.js";
import {fetchName} from "@/services/UserApi.js";
import {springAPI} from "@/services/axios.js";
import AlarmModal from "@/components/AlarmModal.vue";
import EmployeeProfile from "@/components/EmployeeProfile.vue";
import {createFinalEval} from "@/services/FinalEvalApi.js";
import {useNotificationStore} from "@/stores/NotificationStore.js";

const userStore = useUserStore();
const shouldShowAlarms = ref(false);
const shouldShowProfile = ref(false);
const activeMenu = ref(null);
const activeSubMenu = ref(null);
const isLoading = ref(false);

const openProfileModal = () => {
  shouldShowProfile.value = !shouldShowProfile.value;
  shouldShowAlarms.value = false;
};

const openAlarmModal = () => {
  shouldShowAlarms.value = !shouldShowAlarms.value;
  shouldShowProfile.value = false;
};

const toggleMenu = (menuName) => {
  if (activeMenu.value === menuName) {
    // 이미 활성화된 메뉴를 클릭하면 닫지 않음
    activeMenu.value = null; // 메뉴 상태 초기화
  } else {
    activeMenu.value = menuName;
    activeSubMenu.value = null; // 서브 메뉴 상태 초기화
  }
};

const activateSubMenu = (subMenuName) => {
  activeSubMenu.value = subMenuName;
};

const resetModalsAndMenu = () => {
  shouldShowAlarms.value = false;
  shouldShowProfile.value = false;
};

const handleOutsideClick = (event) => {
  const asideMenu = document.querySelector('.aside-menu');
  const alarmModal = document.querySelector('.alarm-modal');
  const profileModal = document.querySelector('.profile-modal');

  if (!asideMenu?.contains(event.target) &&
      !alarmModal?.contains(event.target) &&
      !profileModal?.contains(event.target)) {
    resetModalsAndMenu();
  }
};

const handleViewChange = () => {
  resetModalsAndMenu();
  activeMenu.value = null;
  activeSubMenu.value = null;
};

router.beforeEach(async (to, from, next) => {
  resetModalsAndMenu();

  if (to.path === '/final-eval') {
    isLoading.value = true; // 로딩 상태 설정
    await nextTick(); // DOM 업데이트를 강제로 반영

    try {
      await creatingFinalEval(); // 비동기 작업 실행
    } catch (error) {
      alert('최종 평가 생성 중 오류가 발생했습니다.');
    } finally {
      isLoading.value = false; // 항상 로딩 상태 해제
      next(); // 라우팅 처리
    }
  } else {
    next(); // 다른 라우팅은 그대로 진행
  }
});

const logout = () => {
  userStore.logout();
};

const employeeSeq = ref(null);
const employeeName = ref("");
const loadName = async (employeeSeq) => {
  if (!employeeSeq) return;

  try {
    const name = await fetchName(employeeSeq);
    if (name) employeeName.value = name;
  } catch (error) {
    console.error("Error loading name:", error);
    employeeName.value = "";
  }
};

const notificationStore = useNotificationStore();
const menus = ref([
  // 멘티 ASIDE
  {name: "멘토 소개", url: "/mentor/intro", role: "MENTEE"},
  {name: "인턴 위키", url: "/wiki", role: "MENTEE"},
  // { name: "멘토 채팅", url: "/mentor-chat", role: "MENTEE" },
  {name: "보고서 조회", url: "/mentoring/report", role: "MENTEE"},

  // 담당자 ASIDE
  {name: "사원 관리", url: "/employee-management", role: "HR"},
  {
    name: "멘토링",
    role: "HR",
    subMenus: [
      {name: "멘토링 매칭", url: "/mentoring/matching"},
      {name: "멘토링 계획서", url: "/mentoring/planning"},
      {name: "멘토링 보고서", url: "/mentoring/report"},
    ],
  },
  {name: "온보딩 설계", url: "/onboarding/design", role: "HR"},
  {
    name: "온보딩 데이터 입력",
    role: "HR",
    subMenus: [
      {name: "퀴즈 관리", url: "/hr/quiz"},
      {name: "과제 등록", url: "/task/add"},
      {name: "과제 리스트 조회", url: "/task/list"},
      {name: "동료 평가 지표 관리", url: "/hr/peer/review/list"},
      {name: "공통 평가 지표 관리", url: "/taskInd/manage"},
    ],
  },
  {
    name: "온보딩 결과 조회",
    role: "HR",
    subMenus: [
      {name: "퀴즈 결과 조회", url: "/hr/quiz/result"},
      {name: "과제 평가 조회", url: "/task-eval"},
      {name: "동료 평가 조회", url: "/hr/peer/review"},
    ],
  },
  {name: "최종 평가", url: "/final-eval", role: "HR"},
  {name: "위키 관리", url: "/wiki", role: "HR"},
  {name: "챗봇 커스텀", url: "/hr/chatbot", role: "HR"},

  // 멘토, 팀장 ASIDE
  {
    name: "멘토링",
    role: "MENTOR",
    subMenus: [
      {name: "멘티 소개", url: "/mentee/intro"},
      {name: "멘토링 계획서", url: "/mentoring/planning"},
      {name: "멘토링 보고서", url: "/mentoring/report"},
    ],
  },
  {
    name: "멘토링",
    position: "팀장",
    subMenus: [
      {name: "멘토링 계획서", url: "/mentoring/planning"},
      {name: "멘토링 보고서", url: "/mentoring/report"},
    ],
  },
  {
    name: "온보딩 과제 관리",
    role: "MENTOR",
    position: "팀장",
    subMenus: [
      {name: "온보딩 과제 추가", url: "/task/add"},
      {name: "온보딩 과제 조회", url: "/task/list"},
    ],
  },
  {
    name: "온보딩 결과 조회",
    role: "MENTOR",
    position: "팀장",
    subMenus: [
      {name: "과제 평가 조회", url: "/task-eval"},
    ],
  },
  {name: "최종 평가", url: "/final-eval", role: "MENTOR", position: "팀장"},
  {name: "위키 조회", url: "/wiki", role: "MENTOR", position: "팀장"},
]);

const employeeInfo = computed(() => userStore.getEmployeeInfo());
const filteredMenus = computed(() => {
  if (!employeeInfo.value) {
    return [];
  }
  const role = employeeInfo.value.employeeRole[0];
  const positionName = employeeInfo.value.employeePositionName;
  return menus.value.filter(
      (menu) => menu.role === role || menu.position === positionName)
});

const creatingFinalEval = async () => {
  try {
    const response = await createFinalEval();
  } catch (error) {
    console.error("최종 평가 등록 실패", error);
  }
}

onMounted(async () => {
  document.addEventListener("click", handleOutsideClick);

  if (employeeInfo.value) {
    employeeSeq.value = employeeInfo.value.employeeSeq;

    // 인터셉터 초기화 확인
    if (!userStore.interceptorsInitialized) {
      userStore.initializeInterceptors();
    }

    // 토큰 설정이 확실히 되었는지 확인
    if (!springAPI.defaults.headers.common['Authorization'] && userStore.accessToken) {
      springAPI.defaults.headers.common['Authorization'] = `Bearer ${userStore.accessToken}`;
    }

    // 약간의 지연 후 데이터 요청
    if (springAPI.defaults.headers.common['Authorization']) {
      await new Promise(resolve => setTimeout(resolve, 100));

      // 데이터 요청
      await Promise.all([
        await loadName(employeeSeq.value),
        await notificationStore.updateNotiCount()
      ]);
    }
  }
});
</script>

<style scoped>
.aside-login-name {
  position: relative;
  font-weight: 600;
  font-size: 20px;
  display: flex;
  gap: 10px;
  margin-left: -3px;
}

.aside-logout-button {
  cursor: pointer;
  margin-top: 10px;
  margin-bottom: 30px;
  color: var(--gray);
  display: flex;
  gap: 10px;
}

.aside-menu-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.aside-menu {
  width: 200px;
  height: 100vh;
  flex-direction: column;
  align-items: center;
  background-color: var(--white);
  padding: 20px;
  box-sizing: border-box;
  text-align: center;
  flex-shrink: 0;
}

.logo {
  margin-top: 50px;
  font-size: 30px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  margin-bottom: 60px;
}

.logo-style {
  text-decoration: none;
  color: var(--black);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.menu-item {
  position: relative;
  margin: 3px 0px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.menu-item:hover .sub-menu {
  display: block; /* 마우스를 올리면 보여줌 */
}

.menu-item a {
  text-decoration: none;
  color: var(--black);
  font-family: 'Inter', sans-serif;
}

.menu-item .active + .sub-menu {
  display: block;
}

.menu-item > div.active {
  color: var(--purple);
  font-weight: bold;
}

.sub-menu-item.active {
  font-weight: bold;
}

.sub-menu {
  display: none; /* 기본적으로 숨김 */
  position: relative;
  font-weight: normal;
  padding: 1rem 0;
  text-align: left;
}

.login-name {
  cursor: pointer;
}

.notify {
  display: flex;
  margin-top: 3px;
}

.notify-box {
  cursor: pointer;
}

.notify-count {
  position: absolute;
  font-size: 15px;
  width: 18px;
  background-color: var(--red);
  color: var(--white);
  border-radius: 13px;
  top: -8px;
  right: -8px;
}

.alarm-modal {
  position: absolute;
  z-index: 1000;
  top: 180px;
  left: 220px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 380px;
  max-height: 500px;
  overflow: hidden;
}

.active {
  color: var(--purple);
  background-color: #f0f4ff;
}

.profile-modal {
  position: absolute;
  z-index: 1000;
  top: 180px;
  left: 220px;
}

.loading-spinner {
  left: 200px;
  width: 90%;
  height: 100%;
  position: absolute;
  background-color: var(--ivory);
  z-index: 5;
}

.spinner {
  border: 4px solid var(--yellow);
  border-top: 4px solid var(--purple);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
