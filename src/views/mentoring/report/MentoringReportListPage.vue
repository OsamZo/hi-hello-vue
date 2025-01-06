<!-- MentoringReportView.vue -->
<script setup>
import {ref, onMounted} from 'vue';
import SearchBarComponent from '@/components/SearchBarComponent.vue';
import ListComponent from '@/components/ListComponent.vue';
import router from "@/router/index.js";
import {
  fetchReportListByHR, fetchReportListByLeader,
  fetchReportListByMentee,
  fetchReportListByMentor,
  searchReports, searchReportsByLeader
} from "@/services/MentoringApi.js";
import {useUserStore} from "@/stores/UserStore.js";
import WhiteBoxComponent from "@/components/WhiteBoxComponent.vue";
import WhiteBoxListComponent from "@/components/WhiteBoxListComponent.vue";

// 상태 관리
const reports = ref([]);
const loading = ref(false);
const searchCategory = ref('name');

const employeeInfo = useUserStore().getEmployeeInfo();
const employeeRole = employeeInfo.employeeRole;
const employeePositionName = employeeInfo.employeePositionName;

// 검색 처리 함수
const handleSearch = async (keyword) => {
  loading.value = true;

  if (!keyword.trim()) {  // 검색어가 비어있다면
    const response = ref(null);
    if (employeeRole[0] === 'MENTEE') {
      response.value = await fetchReportListByMentee();
    } else if (employeeRole[0] === 'MENTOR') {
      response.value = await fetchReportListByMentor();
    } else if (employeeRole[0] === 'HR') {
      response.value = await fetchReportListByHR();
    } else if (employeePositionName === '팀장') {
      response.value = await fetchReportListByLeader();
    } else {
      alert('접근 권한이 없습니다.');
      router.back();
    }
    reports.value = response.value.data.data;
    loading.value = false;
    return;
  }

  try {
    const response = ref(null);
    // 담당자
    if (employeeRole[0] === 'HR') {
      response.value = await searchReports(searchCategory, keyword);
    } else if (employeePositionName === '팀장') {
      response.value = await searchReportsByLeader(searchCategory, keyword);
    }
    reports.value = response.value.data.data;
  } catch (error) {
    // console.error('검색 중 오류 발생:', error);
    alert('검색 중 오류가 발생하였습니다.');
    location.reload();
  } finally {
    loading.value = false;
  }
};

// 라우팅 처리 함수(보고서 작성)
const goToRegisterPage = () => {
  router.push('/report/edit');
};

// 라우팅 처리 함수(상세 조회)
const goToDetail = (reportSeq) => {
  router.push(`/mentoring/report/${reportSeq}`);
}

// 초기 데이터 로드
onMounted(async () => {
  await handleSearch('');
});
</script>

<template>
  <div class="report-container">
    <div class="title-section">
      <div class="title">멘토링 보고서</div>
    </div>

    <div class="search-section" v-if="employeeRole[0] !== 'MENTEE' && employeeRole[0] !== 'MENTOR'">
      <SearchBarComponent @search="handleSearch"/>
      <select v-model="searchCategory" class="box">
        <option value="name">이름</option>
        <option value="num">사번</option>
      </select>
    </div>
    <div class="create-box" @click="goToRegisterPage" v-if="employeeRole[0] === 'MENTEE'">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bibi-plus-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
      </svg>
      <div>보고서 등록</div>
    </div>
    <WhiteBoxComponent class="white-box-background">
      <ListComponent :items="reports">
        <template #header>
          <div class="header-item">순서</div>
          <div class="header-item">제목</div>
          <div class="header-item" v-if="employeeRole[0] !== 'MENTEE' && employeeRole[0] !== 'MENTOR'">작성자</div>
          <div class="header-item">제출날짜</div>
        </template>

        <template #item="{ item, index }">
          <div @click="goToDetail(item.reportSeq)" class="list-row">
            <div class="list-cell">{{ index + 1 }}</div>
            <div class="list-cell">{{ item.reportWeek }} 주차 보고서</div>
            <div class="list-cell" v-if="employeeRole[0] !== 'MENTEE' && employeeRole[0] !== 'MENTOR'">
              {{ item.menteeName }}
            </div>
            <div class="list-cell">{{ item.regDate }}</div>
          </div>
        </template>
      </ListComponent>
    </WhiteBoxComponent>

  </div>
</template>

<style scoped>
.report-container {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-weight: 600;
  font-size: 30px;
  text-align: center;
  margin-top: 105px;
  margin-bottom: 49px;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.white-box-background {
  width: 60vw;
}

.box {
  border: none;
  background-color: var(--white);
  box-shadow: 2px 2px 4px 0 var(--gray);
  border-radius: 10px;
  width: 100px;
  height: 50px;
  cursor: pointer;
}

.create-box {
  box-shadow: 2px 2px 4px 0 var(--gray);
  background-color: var(--purple);
  border-radius: 10px;
  height: 50px;
  display: flex;
  width: 150px;
  align-items: center;
  justify-content: space-evenly;
  justify-self: right;
  font-size: 15px;
  font-weight: 600;
  color: var(--white);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.create-box:hover {
  background-color: var(--dark-purple);
}

.list-row {
  display: flex;
  padding: 10px 20px;
  cursor: pointer;
}

.list-cell {
  flex: 1;
  text-align: center;
}

.header-item {
  flex: 1;
  text-align: center;
}
</style>