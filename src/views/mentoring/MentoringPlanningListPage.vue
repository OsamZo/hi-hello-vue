<script setup>
import ListComponent from "@/components/ListComponent.vue";
import { onMounted, reactive, ref } from "vue";
import { fetchMentoringPlanningList, searchMentoringPlans } from "@/services/MentoringApi.js";
import WhiteBoxListComponent from "@/components/WhiteBoxListComponent.vue";
import SearchBarComponent from "@/components/SearchBarComponent.vue";
import { useUserStore } from "@/stores/UserStore.js";
import { useRouter } from "vue-router"; // useRouter 추가

const router = useRouter(); // useRouter 사용
const mentoringPlanningList = reactive([]);

const searchCategory = ref("title"); // 기본 검색 카테고리

const userStore = useUserStore();
const employeeInfo = userStore.getEmployeeInfo();
const employeeRole = employeeInfo.employeeRole;
// 멘토링 계획서 리스트 가져오기
const fetchingMentoringPlanningList = async () => {
  try {
    const response = await fetchMentoringPlanningList();
    response.data.forEach(plan => {
      mentoringPlanningList.push({
        planningSeq: plan.planningSeq,
        employeeName: plan.employeeName,
        planningName: plan.planningName,
        planningStatus: plan.planningStatus,
        regDate: plan.regDate,
        fileUrl: plan.fileUrl
      });
    });
  } catch (error) {
    alert("멘토링 계획서 리스트를 조회하던 중 오류가 발생했습니다.");
  }
};
// 상태별 클래스와 텍스트 반환
const getStatusClass = (status) => {
  switch (status) {
    case 'APPROVE':
      return { class: 'approved', text: '승인' };
    case 'PENDING':
      return { class: 'pending', text: '대기' };
    case 'REJECT':
      return { class: 'rejected', text: '반려' };
    default:
      return { class: '', text: status };
  }
};


// 검색 로직
const searchPlans = async (query) => {
  if (!query.trim()) { // 검색어가 비어있다면
    await fetchingMentoringPlanningList(); // 전체 데이터를 다시 가져옴
    return;
  }
  try {
    // console.log("검색 호출 시작:", searchCategory.value, query);
    const encodedQuery = encodeURIComponent(query);
    const response = await searchMentoringPlans(searchCategory.value, encodedQuery);
    mentoringPlanningList.splice(0); // 기존 리스트 초기화
    response.data.data.forEach(plan => {
      mentoringPlanningList.push({
        planningSeq: plan.planningSeq,
        employeeName: plan.employeeName,
        planningName: plan.planningName,
        planningStatus: plan.planningStatus,
        regDate: plan.regDate,
        fileUrl: plan.fileUrl
      });
    });
  } catch (error) {
    alert("해당하는 데이터가 없습니다.");
  }
};

const goToRegisterPage = () => {
  router.push(`/mentoring/planning/create`);
};

const goToDetailPage = (planningSeq) => {
  router.push(`/mentoring/planning/${planningSeq}`);
};

onMounted(async () => {
  await fetchingMentoringPlanningList();
});
</script>


<template>
  <div class="content_box">
    <div class="title">멘토링 계획서</div>
    <div class="search_bar_container">
      <div class="search-box">
        <SearchBarComponent @search="searchPlans" />
        <select v-model="searchCategory" class="box">
          <option value="title">제목</option>
          <option value="name">기안자</option>
        </select>
        <div class="yellow-box" v-if="employeeRole[0] === 'MENTOR'" @click="goToRegisterPage">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
          </svg>
          <div>계획서 등록</div>
        </div>
      </div>

    </div>
    <WhiteBoxListComponent>
      <ListComponent :items="mentoringPlanningList">
        <template #header>
          <div>순서</div>
          <div>제목</div>
          <div class="flex">
            <div class="left-title">기안자</div>
            <div class="left-title">상태</div>
            <div class="left-title">날짜</div>
          </div>
        </template>

        <template #item="{ item, index }">
          <div class="flex-line item-row" @click="goToDetailPage(item.planningSeq)">
            <div>{{ index + 1 }}</div>
            <div>{{ item.planningName }}</div>

            <div class="flex">
              <div class="left-title">{{ item.employeeName }}</div>
              <div :class="getStatusClass(item.planningStatus).class" class="left-title">{{ getStatusClass(item.planningStatus).text }}</div>
              <div class="left-title">{{ item.regDate }}</div>
            </div>
          </div>
        </template>
      </ListComponent>
    </WhiteBoxListComponent>
  </div>
</template>

<style scoped>
/* 상태에 따른 스타일 */
.approved {
  color: var(--purple);
  font-weight: 700;
}
.pending {
  color: var(--black);
  font-weight: 700;
}
.rejected {
  color: var(--red);
  font-weight: 700;
}

.item-row {
  cursor: pointer;
}

.yellow-box{
  box-shadow: 2px 2px 4px 0 var(--gray);
  background-color: var(--purple);
  border-radius: 10px;
  height: 50px;
  display: flex;
  width: 200px;
  align-items: center;
  justify-content: space-evenly;
  font-size: 15px;
  font-weight: 600;
  color: var(--white);
  transition: background-color 0.3s ease; /* 배경색 변화 효과 */
}

.yellow-box:hover{
  background-color: var(--dark-purple);
}

.yellow-box img{
  width: 25px;
  height: 25px;
}
.left-title{
  width: 70px;
  display: flex;
  justify-content: center;
}
.content_box {
  width: 70%;
  margin: 0 auto;
}
.flex{
  display: flex;
}
.flex-line{
  display: flex;
  margin: 10px 20px;
  padding-left: 14px;
  font-size: 13px;
  justify-content: space-between;
}
.title {
  font-size: 30px;
  font-weight: 700;
  text-align: center;
  margin: 105px 0px 49px 0px;
}
.search_bar_container {
  width: 90%;
  margin: 29px auto;
  align-items: center;
}
.search-box{
  display: flex;
  gap: 20px;
}
.box{
  border: none;
  background-color: var(--white);
  box-shadow: 2px 2px 4px 0 var(--gray);
  border-radius: 10px;
  width: 100px;
  height: 50px;
  cursor: pointer;
}
</style>
