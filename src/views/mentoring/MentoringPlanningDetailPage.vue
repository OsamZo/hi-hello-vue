<script setup>
import { ref, onMounted } from 'vue';
import {useRoute, useRouter} from 'vue-router';
import { fetchMentoringPlanDetail, updateMentoringPlanStatus } from '@/services/MentoringApi.js';
import WhiteBoxListComponent from "@/components/WhiteBoxListComponent.vue";
import {useUserStore} from "@/stores/UserStore.js";

const router = useRouter();
const route = useRoute();
const planningSeq = ref(null); // planningSeq를 안전하게 보관
const planDetail = ref({}); // API 데이터를 저장 (빈 객체로 초기화)

const userStore = useUserStore();
const employeeInfo = userStore.getEmployeeInfo();
const employPosition = employeeInfo.employeePositionName;

const goToBack = () => {
  router.push(`/mentoring/planning`);
};
// 라우트가 유효할 때 planningSeq 추출
onMounted(() => {
  if (route.params && route.params.planningSeq) {
    planningSeq.value = route.params.planningSeq;
    getPlanDetail();
  }
});

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

// 계획서 상세 조회
const getPlanDetail = async () => {
  try {
    const response = await fetchMentoringPlanDetail(planningSeq.value);
    if (response && response.data) {
      planDetail.value = response.data;
    } else {
      planDetail.value = {};
    }
  } catch (error) {
    // console.error("멘토링 계획서 상세 조회 오류:", error);
    planDetail.value = {};
  }
};

// 버튼 클릭 이벤트 처리
const handleButtonClick = async (event) => {
  const planningStatus = event.target.id; // 클릭된 버튼의 id 값(APPROVE or REJECT)
  // console.log(planningStatus)
  try {
    // 서버에 PUT 요청 보내기
    const response = await updateMentoringPlanStatus(planningSeq.value, planningStatus);
    alert("계획서가 성공적으로 처리되었습니다.");

    // 성공적으로 처리되면 새로고침 또는 뒤로 가기
    router.push(`/mentoring/planning`);
  } catch (error) {
    // console.error("계획서 처리 오류:", error);
    alert("오류가 발생했습니다. 다시 시도해주세요.");
  }
};
</script>

<template>
  <div class="content-box">
    <!-- 상세 데이터 화면 -->
    <div class="mentor-plan-detail-page-title">멘토링 계획서</div>
    <WhiteBoxListComponent>
      <div class="detail-container">
        <div class="small">
          <div class="date">{{ planDetail.regDate }}</div>
          <div :class="getStatusClass(planDetail.planningStatus).class" class="statue">{{ getStatusClass(planDetail.planningStatus).text }}</div>
        </div>
        <div class="inline">
          <div class="head">기안자</div>
          <div class="content-line">{{ planDetail.employeeName }}</div>
        </div>
        <div class="inline">
          <div class="head">제목</div>
          <div class="content-line">{{ planDetail.planningName }}</div>
        </div>
        <div class="inline">
          <div class="head">계획서 내용</div>
          <div class="content-line">{{ planDetail.planningContent }}</div>
        </div>
        <div class="inline">
          <div class="head">첨부 파일</div>
          <a :href="planDetail.fileUrl" target="_blank" class="content-line">{{ planDetail.fileName }}</a>
        </div>
        <div class="button-container">
          <div v-if="employPosition === '팀장'" class="inline buttons"> <!-- 팀장만 보이는 버튼 -->
            <div class="approve" id="APPROVE" @click="handleButtonClick($event)">승인</div>
            <div class="deny" id="REJECT" @click="handleButtonClick($event)">반려</div>
          </div>
          <div class="goToBack"  @click="goToBack">뒤로가기</div><!-- 모두가 볼 수 있음 -->
        </div>
      </div>
    </WhiteBoxListComponent>
  </div>
</template>

<style scoped>
.buttons{
  color: var(--white);
  font-size: 15px;
  font-weight: 700;
  gap: 20px;
  justify-content: center;
}
.approve{
  background-color: var(--purple);
  width: 50%;
  border-radius: 10px;
  height: 33px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.deny{
  background-color: var(--black);
  width: 50%;
  border-radius: 10px;
  height: 33px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.button-container{
  margin-top: 15px;
}
.goToBack{
  border-radius: 10px;
  background: var(--black);
  box-shadow: 2px 2px 4px 0px rgba(0, 0, 0, 0.25);
  color: var(--white);
  height: 30px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  max-width: 300px;
  cursor: pointer;
}
.inline{
  display: flex;
  margin: 15px 0px;
}
.head{
  font-size: 15px;
  font-weight: 700;
  width: 110px;
}
.statue{
  font-size: 15px;
  color: var(--red);
  font-weight: bold;
}
.mentor-plan-detail-page-title{
  font-size: 30px;
  font-weight: 700;
  text-align: center;
  margin: 105px 0px 49px 0px;
}
.content-box {
  width: 550px;
}
.content-line{
  width: 330px;
}
.detail-container{
  display: flex;
  flex-direction: column;

}
.small{
  display: flex;
  font-size: 12px;
  gap: 15px;
  margin-bottom: 10px;
  align-items: center;
}
</style>
