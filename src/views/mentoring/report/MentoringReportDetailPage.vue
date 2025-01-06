<script setup>
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {getReportDetail, updateFeedback, updateReport} from "@/services/MentoringApi.js";
import {useUserStore} from "@/stores/UserStore.js";

const router = useRouter();
const route = useRoute();

// 상태 관리
const employeeInfo = useUserStore().getEmployeeInfo();
const employeeRole = employeeInfo.employeeRole[0];
const employeeSeq = employeeInfo.employeeSeq;
const reportSeq = ref(Number(route.params.reportSeq));
const reportWeek = ref(0);
const reportContent = ref('');
const editedReportContent = ref('');
const reportFeeling = ref('');
const editedReportFeeling = ref('');
const reportFeedbackContent = ref('');
const editedMentorFeedback = ref('');
const menteeName = ref('');
const mentorName = ref('');

// 상세 조회 api
const loadReportDetail = async () => {
  try {
    const response = await getReportDetail(reportSeq.value);
    menteeName.value = response.data.data.menteeName;
    mentorName.value = response.data.data.mentorName;
    reportWeek.value = response.data.data.reportWeek;
    reportContent.value = response.data.data.reportContent;
    reportFeeling.value = response.data.data.reportFeeling;
    reportFeedbackContent.value = response.data.data.reportFeedbackContent;
  } catch (error) {
    console.error('상세 조회 중 오류가 발생하였습니다.'.error);
    // alert('상세 조회 중 오류가 발생하였습니다.');
  }

}

// 멘토 피드백 수정 모드 상태
const isMentorFeedbackEditing = ref(false);
const isReportEditing = ref(false);

// 멘티 보고서 수정 핸들러
const handleReportEdit = async () => {
  if (isReportEditing.value) {
    try {
      const editData = {
        reportContent: editedReportContent.value,
        reportFeeling: editedReportFeeling.value
      }
      await updateReport(employeeSeq, reportSeq.value, editData);
      reportContent.value = editedReportContent.value;
      reportFeeling.value = editedReportFeeling.value;
    //   console.log('보고서가 저장되었습니다.')
    } catch (error) {
      console.error('보고서 저장 중 오류가 발생했습니다:', error)
      return
    }
  } else {
    editedReportContent.value = reportContent.value;
    editedReportFeeling.value = reportFeeling.value;
  }
  isReportEditing.value = !isReportEditing.value;
}

const handleReportCancel = () => {
  editedReportContent.value = reportContent.value;
  editedReportFeeling.value = reportFeeling.value;
  isReportEditing.value = false;
}

// 멘토 피드백 수정 핸들러
const handleMentorFeedbackEdit = async () => {
  if (isMentorFeedbackEditing.value) {
    try {
      await saveMentorFeedback(editedMentorFeedback.value);
      reportFeedbackContent.value = editedMentorFeedback.value;
      // console.log('멘토 피드백이 저장되었습니다.')
    } catch (error) {
      // console.error('멘토 피드백 저장 중 오류가 발생했습니다:', error)
      return
    }
  } else {
    editedMentorFeedback.value = reportFeedbackContent.value
  }
  isMentorFeedbackEditing.value = !isMentorFeedbackEditing.value
}

const handleMentorFeedbackCancel = () => {
  editedMentorFeedback.value = reportFeedbackContent.value;
  isMentorFeedbackEditing.value = false;
}

// API 호출 함수
const saveMentorFeedback = async (editedMentorFeedback) => {
  try {
    await updateFeedback(employeeSeq, reportSeq.value, editedMentorFeedback);
  } catch (error) {
    console.error('saveFeedback 메서드 피드백 수정 중 오류가 발생하였습니다.'.error);
    // alert('피드백 수정중 오류가 발생하였습니다.');
    throw error;
  }
}

const goBack = () => {
  router.back();
}

onMounted(() => {
  loadReportDetail();
})
</script>

<template>
  <div class="report-container-section">
    <div class="report-title-section">
      <div class="report-week">{{ reportWeek }}주차</div>
      <h1 class="report-title">보고서</h1>
    </div>

    <div class="employee-name-section">
      <div class="mentoring-info">
        <div class="mentoring-section">
          <span>멘토 </span>
          <div class="employee-name">{{ mentorName }}</div>
        </div>
        <div class="mentoring-section">
          <span>멘티 </span>
          <div class="employee-name">{{ menteeName }}</div>
        </div>
      </div>
      <div class="back-btn-box">
        <button class="back-btn" @click="goBack">뒤로가기</button>
      </div>
    </div>




    <div class="report-write-section">
      <section class="report-section">
        <div class="mentee-section">
          <div class="content-section">
            <h2>활동 내용</h2>
            <div class="content-box" v-if="!isReportEditing">
              <p>{{ reportContent }}</p>
            </div>
            <div class="content-box" v-else>
        <textarea
            v-model="editedReportContent"
            class="feedback-textarea"
            rows="4"
        ></textarea>
            </div>

            <h2>배움점 및 소감</h2>
            <div class="content-box" v-if="!isReportEditing">
              <p>{{ reportFeeling }}</p>
            </div>
            <div class="content-box" v-else>
        <textarea
            v-model="editedReportFeeling"
            class="feedback-textarea"
            rows="4"
        ></textarea>
            </div>
          </div>
        </div>
      </section>
      <div class="button-container" v-if="employeeRole === 'MENTEE'">
        <button class="edit-button" @click="handleReportEdit">
          {{ isReportEditing ? '저장하기' : '수정하기' }}
        </button>
        <button
            v-if="isReportEditing"
            class="cancel-button"
            @click="handleReportCancel"
        >
          취소하기
        </button>
      </div>
    </div>

    <hr class="section-line">

    <div>
      <h2>멘토 피드백</h2>
    </div>

    <div class="report-write-section">
      <section class="report-section">
        <div class="content-box" v-if="!isMentorFeedbackEditing">
          <p v-if="reportFeedbackContent">{{ reportFeedbackContent }}</p>
          <p v-else class="no-feedback">피드백이 아직 작성되지 않았습니다.</p>
        </div>
        <div class="content-box" v-else>
        <textarea
            v-model="editedMentorFeedback"
            class="feedback-textarea"
            rows="4"
        ></textarea>
        </div>
      </section>
      <div class="button-container" v-if="employeeRole === 'MENTOR'">
        <button class="edit-button" @click="handleMentorFeedbackEdit">
          {{ isMentorFeedbackEditing ? '저장하기' : '수정하기' }}
        </button>
        <button
            v-if="isMentorFeedbackEditing"
            class="cancel-button"
            @click="handleMentorFeedbackCancel"
        >
          취소하기
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.report-container-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.report-title-section {
  display: flex;
  justify-items: center;
  align-items: baseline;
  width: 55vw;
}

.report-week {
  display: flex;
  background-color: var(--white);
  border-radius: 8px;
  height: 2vw;
  width: 5vw;
  align-items: center;
  justify-content: center;
  text-align: left;
  box-shadow: 2px 2px 4px 0 var(--gray);
}

.report-title {
  text-align: center;
  flex-grow: 1;
}

.employee-name-section {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-content: center;
  justify-content: space-between;
  margin-bottom: 15px;
  width: 59vw;
}

.employee-name {
  display: inline-block;
}

.mentoring-section {
  flex-basis: 100%; /* 각 요소가 전체 너비를 사용하도록 설정 */
}

.mentoring-section > span {
  align-items: center;
  font-weight: bold;
}

.report-section {
  margin-bottom: 30px;
  box-shadow: 2px 2px 4px 0 var(--gray);
  width: 59vw;
}

.report-write-section {
  justify-items: center;
  width: 59vw;
}

.content-section {
  background-color: var(--white);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 10px;
}

.content-box {
  background-color: var(--white);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 10px;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.section-line {
  width: 59vw;
}

.cancel-button {
  background-color: var(--gray);
  color: var(--white);
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.cancel-button:hover {
  background-color: var(--black);
}

.edit-button {
  background-color: var(--purple);
  color: var(--white);
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.edit-button:hover {
  background-color: var(--dark-purple);
}

.feedback-textarea {
  width: 100%;
  border: 1px solid var(--white);
  border-radius: 4px;
  padding: 10px;
  font-size: 14px;
  resize: vertical;
}

h2 {
  font-size: 18px;
  margin-bottom: 15px;
}

.no-feedback {
  color: var(--gray);
  text-align: center;
  font-style: italic;
}

.back-btn {
  background-color: var(--gray);
  color: var(--white);
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.back-btn:hover {
  background-color: var(--black);
}
</style>