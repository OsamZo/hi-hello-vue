<script setup>
import { ref } from "vue";
import { submitMentoringPlanService } from "@/services/MentoringApi.js";
import { useUserStore } from "@/stores/UserStore.js";
import WhiteBoxListComponent from "@/components/WhiteBoxListComponent.vue";
import router from "@/router/index.js";

// 기안자 ID는 로그인한 사용자 정보에서 추출
const employeeSeq = useUserStore().getEmployeeInfo().employeeSeq;

// 폼 데이터 초기 상태
const mentoringPlanForm = ref({
  employeeSeq: employeeSeq,
  planningName: "",
  planningContent: "",
  file: null,
  fileName: "",
});

// 파일 선택 시 파일과 파일 이름 추출
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    mentoringPlanForm.value.file = file;
    mentoringPlanForm.value.fileName = file.name;  // 자동으로 파일 이름 추출
  }
};

// 폼 제출 로직
const submitMentoringPlan = async () => {
  // 파일이 선택되지 않은 경우 경고 메시지 출력
  if (!mentoringPlanForm.value.file) {
    alert("파일을 첨부해주세요.");
    return; // 파일이 없으면 더 이상 진행되지 않도록
  }

  try {
    const formData = new FormData();
    formData.append("createProductReqDTO", JSON.stringify({
      employeeSeq: mentoringPlanForm.value.employeeSeq,
      planningName: mentoringPlanForm.value.planningName,
      planningContent: mentoringPlanForm.value.planningContent,
      fileName: mentoringPlanForm.value.fileName,
    }));
    formData.append("productImgUrl", mentoringPlanForm.value.file);

    // 디버그 출력: FormData의 내용을 확인
    // for (let pair of formData.entries()) {
    //   console.log(pair[0] + ": " + pair[1]);
    // }

    // API 호출
    const response = await submitMentoringPlanService(formData);
    alert("계획서 등록이 되었습니다.");

    // 폼 초기화
    mentoringPlanForm.value.planningName = "";
    mentoringPlanForm.value.planningContent = "";
    mentoringPlanForm.value.file = null;
    mentoringPlanForm.value.fileName = "";

    router.push("/mentoring/planning");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "등록 중 오류가 발생했습니다. 다시 시도해주세요.";
    alert(errorMessage);
  }
};
const goToBack = () => {
  router.push(`/mentoring/planning`);
};
</script>

<template>
  <div class="planning-container">
    <div class="mentoring-plan-page-title">멘토링 계획서 등록</div>

    <WhiteBoxListComponent>
      <form @submit.prevent="submitMentoringPlan">
        <div class="form-group">
          <label for="planningName">제목</label>
          <input
              id="planningName"
              v-model="mentoringPlanForm.planningName"
              type="text"
              placeholder="계획서 제목을 입력하세요"
          />
        </div>
        <div class="form-group">
          <label for="planningContent">내용</label>
          <textarea
              id="planningContent"
              v-model="mentoringPlanForm.planningContent"
              placeholder="계획서 내용을 입력하세요"
          ></textarea>
        </div>
        <div class="form-group">
          <div class="file_name">파일</div>
          <label for="file" class="file_button">
            <svg id="file-button" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-paperclip" viewBox="0 0 16 16">
              <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/>
            </svg>
            <p v-if="mentoringPlanForm.fileName" id="file-name">{{ mentoringPlanForm.fileName }}</p>
          </label>
          <input
              id="file"
              type="file"
              accept=".jpg, .png, .pdf"
              @change="handleFileChange"
              style="display: none;"
          />
        </div>
        <br><br>
        <div class="button-group">
          <input type="submit" class="submit-button" value="등록">
          <input type="button" class="gotoback" @click="goToBack" value="취소">
        </div>

      </form>
    </WhiteBoxListComponent>
  </div>
</template>

<style scoped>
.form-group {
  display: flex;
  flex-direction: row;
  margin: 5px 0px;
  justify-content: center;
  gap: 50px;
}
.file_name{
  margin-top: 10px;
}
.planning-container {
  width: 550px;
}
#planningName,
#planningContent {
  all: unset;
  background-color: var(--white);
  width: 70%;
  border-radius: 10px;
  border: 2px solid var(--border-color);
  padding-left: 15px;
}
#planningName{
  height: 33px;
}
#planningContent{
  height: 150px;
  padding-top: 10px;
}
.mentoring-plan-page-title{
  text-align: center;
  margin: 105px 0px 49px 0px;
  font-size: 30px;
  font-weight: 700;
}
.button-group{
  display: flex;
  margin: 0 auto;
  gap: 10px;
}
.button-group input {
  cursor: pointer;
}

.submit-button {
  width: 140px;
  height: 30px;
  background-color: var(--purple);
  font-weight: 600;
  font-size: 15px;
  color: var(--white);
  margin: 0 auto;
  border: none;
  border-radius: 10px;
}
.gotoback{
  width: 140px;
  height: 30px;
  background-color: var(--black);
  font-weight: 600;
  font-size: 15px;
  color: var(--white);
  margin: 0 auto;
  border: none;
  border-radius: 10px;
}
.form-group label{
  margin-top: 5px;
}
form {
  display: flex;
  flex-direction: column;
}

.file_button {
  border-radius: 10px;
  width: 70%;
  background-color: var(--ivory);
  padding-left: 15px;
  display: flex;
  align-items: center;
  height: 33px;
  cursor: pointer;
}

#file-name {
  font-size: 14px;
  color: var(--gray);
  margin-top: 10px;
}
textarea{
  height: 150px;
}
</style>
