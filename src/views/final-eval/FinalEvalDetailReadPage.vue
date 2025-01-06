<script setup>
import "@/styles/final-eval/FinalEvalDetailPage.css"
import WhiteBoxComponent from "@/components/WhiteBoxComponent.vue";
import {fetchFinalEvalResultDetail} from "@/services/FinalEvalApi.js";
import {onMounted, reactive, ref} from "vue";
import {useRoute} from "vue-router";
import router from "@/router/index.js";

const route = useRoute();

const profileImgUrl = ref('');
const employeeName = ref('');
const employeePhone = ref('');
const employeeEmail = ref('');
const departmentName = ref('');
const employeeNum = ref('');
const finalEvalResults = reactive([]);
const finalEvalTotalScore = ref(0);

const fetchingFinalEvalResultDetail = async (employeeSeq) => {
  try {
    const response = await fetchFinalEvalResultDetail(employeeSeq);
    profileImgUrl.value = response.data.data.profileImgUrl;
    employeeName.value = response.data.data.employeeName;
    employeePhone.value = response.data.data.employeePhone
    employeeEmail.value = response.data.data.employeeEmail;
    departmentName.value = response.data.data.departmentName;
    employeeNum.value = response.data.data.employeeNum;

    response.data.data.finalEvalResults.forEach(finalEvalResult => {
      finalEvalResults.push({
        finalEvalIndName: finalEvalResult.finalEvalIndName,
        finalEvalScore: finalEvalResult.finalEvalScore
      })
      finalEvalTotalScore.value += finalEvalResult.finalEvalScore;
      finalEvalTotalScore.value = parseFloat(finalEvalTotalScore.value.toFixed(2));   // 소수 둘째 자리로 반올림
    })
  } catch (error) {
    alert("최종 평과 결과 상세 내용을 조회하던 도중 오류가 발생했습니다.");
  }
}

const goBackToFinalEvalList = () => {
  router.push(`/final-eval`);
}

onMounted(async () => {
  const employeeSeq = route.params.employeeSeq;
  await fetchingFinalEvalResultDetail(employeeSeq);
})
</script>

<template>
  <div class="final-eval-detail-read">
  <div class="page-container">
    <div class="page-title">최종 평가 조회</div>
    <WhiteBoxComponent class="white-box-component">
      <div class="flex content">
        <div class="left-container">
          <div class="flex">
            <div class="profile-img">
              <img :src="profileImgUrl" alt="사원 프로필 이미지" class="profile-img"/>
            </div>
            <div class="employee-info-container">
              <div class="font-25-bold">{{ employeeName }}</div>
              <div class="user-info-data">{{ employeePhone }}</div>
              <div class="user-info-data">{{ employeeEmail }}</div>
            </div>
          </div>
          <div class="employee-sub-info">
            <div class="flex">
              <div class="employee-sub-info-title">소속</div>
              <div>{{ departmentName }}</div>
            </div>
            <div class="flex">
              <div class="employee-sub-info-title">사번</div>
              <div>{{ employeeNum }}</div>
            </div>
          </div>
        </div>
        <div>
          <div>
            <div class="font-25-bold">평가</div>
            <div class="purple-border-container">
              <div v-for="finalEvalResult in finalEvalResults" class="flex final-eval-result">
                <div>{{ finalEvalResult.finalEvalIndName }}</div>
                <div>{{ finalEvalResult.finalEvalScore }}점</div>
              </div>
            </div>
            <div class="flex final-total-score-container">
              <div>총점</div>
              <div class="final-total-score">{{ finalEvalTotalScore }}점</div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex close-button-container">
        <button class="final-eval-detail-go-back-button flex" @click="goBackToFinalEvalList">뒤로가기</button>
      </div>
    </WhiteBoxComponent>
  </div>
  </div>
</template>