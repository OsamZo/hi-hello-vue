<script setup>
import '@/styles/onboarding/OnboardingData.css'
const COMMON = 'COMMON';
const JOB = 'JOB';

import {
  addChecklistItem,
  deleteTemplate,
  dragOver,
  dragStart,
  drop,
  errorMessage,
  handleFileChange,
  isFormValid,
  loadTemplates,
  newChecklistItem,
  removeChecklistItem,
  resetTemplateData,
  submitTemplate,
  templateForm,
  templateList,
} from '@/services/OnboardingDataApi.js';
import {fetchQuizCategory} from "@/services/QuizCategoryApi.js";
import {onMounted, ref} from "vue";

const quizCategories = ref([]);
const selectedCategory = ref(null);

onMounted(async () => {

  await loadTemplates();

  try {
    const response = await fetchQuizCategory();
    quizCategories.value = response.data || [];
    if (quizCategories.value.length > 0) {
      selectedCategory.value = quizCategories.value[0].quizCategorySeq;
    }
  } catch (err) {
    console.error('퀴즈 카테고리 데이터 로드 실패:', error.value);
  }
});
</script>

<template>
  <div class="onboarding-data-page-title">온보딩 설계</div>
  <div class="onboarding-total-container">
    <!-- 왼쪽 리스트 -->
    <div class="onboarding-data-sidebar">
      <div class="onboarding-page-title">온보딩 절차</div>
      <div class="small-notice">드래그해서 순서를 변경해보세요.</div>
      <ul class="onboarding-ul">
        <li
            v-for="(template, index) in templateList"
            :key="template.id"
            :draggable="true"
            @dragstart="dragStart($event, index)"
            @dragover="dragOver($event)"
            @drop="drop($event, index)"
            class="onboarding-li"
        >
          <div class="onboarding-order">{{ template.templateProcedure }}</div>
          <div class="onboarding-title">{{ template.templateTitle }}</div>
          <button @click="deleteTemplate(template.templateSeq)" class="onboarding-list-delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
          </svg></button>
        </li>
      </ul>
    </div>

    <!-- 템플릿 생성 폼 -->
    <div class="form" >
      <form @submit.prevent="submitTemplate" class="onboarding-data-form">
        <div class="onboarding-data-line">
          <div class="onboarding-data-label">
            <label>템플릿 유형</label>
          </div>
          <select v-model="templateForm.templateType" @change="resetTemplateData">
            <option value="NORMAL">글,파일 템플릿</option>
            <option value="BREAK">휴가 신청 템플릿</option>
            <option value="CF">회의실 예약 템플릿</option>
            <option value="CHECKLIST">CheckList 템플릿</option>
            <option value="VIDEO">영상 템플릿</option>
            <option value="TASK">과제</option>
            <option value="QUIZ">퀴즈</option>
          </select>
        </div>
        <div class="onboarding-data-line">
          <div class="onboarding-data-label">
            <label>체크 필요 여부</label>
          </div>
          <div class="onboarding-data-line">
            <input type="radio" :value="true" v-model="templateForm.templateCheckRequiredStatus" /> 예
          </div>
          <div class="onboarding-data-line">
            <input type="radio" :value="false" v-model="templateForm.templateCheckRequiredStatus" /> 아니오
          </div>
        </div>
        <div class="onboarding-data-line">
          <div class="onboarding-data-label">
            <label>템플릿 종료일</label>
          </div>
          <input type="datetime-local" v-model="templateForm.templateEndAt" required />
        </div>

        <!-- NORMAL Form -->
        <div v-if="templateForm.templateType === 'NORMAL'">
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>공통 교육</label>
            </div>
            <div class="onboarding-data-line">
              <input type="radio" :value="COMMON" v-model="templateForm.templateTrainingType" />공통 교육
            </div>
            <div class="onboarding-data-line">
              <input type="radio" :value="JOB" v-model="templateForm.templateTrainingType" />실무 교육
            </div>
          </div>
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>제목</label>
            </div>
            <input type="text" v-model="templateForm.templateTitle" required/>
          </div>
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>서브내용</label>
            </div>
            <input type="text" v-model="templateForm.templateSub" required>
          </div>
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>파일입력</label>
            </div>
            <label for="file" class="file_button">
              <svg xmlns="http://www.w3.org/2000/svg" id="file-button" width="20" height="20" fill="currentColor" class="bi bi-paperclip" viewBox="0 0 16 16">
                <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/>
              </svg>
              <p v-if="templateForm.templateUrlName" id="file-name">{{ templateForm.templateUrlName }}</p>
            </label>
            <input id="file" type="file" accept=".jpg, .png, .pdf" @change="handleFileChange" style="display: none;">
          </div>
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>상세 내용</label>
            </div>
            <textarea v-model="templateForm.templateDetail"></textarea>
          </div>
        </div>

        <!-- CHECKLIST Form -->
        <div v-if="templateForm.templateType === 'CHECKLIST'">
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>공통 교육</label>
            </div>
            <div class="onboarding-data-line">
              <input type="radio" :value="COMMON" v-model="templateForm.templateTrainingType" />공통 교육
            </div>
            <div class="onboarding-data-line">
              <input type="radio" :value="JOB" v-model="templateForm.templateTrainingType" />실무 교육
            </div>
          </div>
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>제목</label>
            </div>
            <input type="text" v-model="templateForm.templateTitle" required />
          </div>

          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>리스트 추가</label>
            </div>
            <!-- 새로운 항목을 위한 입력 필드 (실시간 바인딩 아님) -->
            <input
                type="text"
                v-model="newChecklistItem"
                placeholder="항목 이름"
            />
          </div>
          <div>
            <button type="button" @click="addChecklistItem" class="onboarding-check-list-add-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
              </svg>
              항목 추가</button>
          </div>
          <!-- 동적으로 추가된 입력 필드 리스트 -->
          <div class="onboarding-data-line">
            <ul>
              <li v-for="(item, index) in templateForm.checklistContent" :key="index" class="plus-check-list">
                <div class="yellow-circle"></div>
                {{ item.checklistContent }}
                <button @click="removeChecklistItem(index)" class="plus-check-list-delete">삭제</button>
              </li>
            </ul>
          </div>
        </div>

        <!-- VIDEO Form -->
        <div v-if="templateForm.templateType === 'VIDEO'">
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>공통 교육</label>
            </div>
            <div class="onboarding-data-line">
              <input type="radio" :value="COMMON" v-model="templateForm.templateTrainingType" />공통 교육
            </div>
            <div class="onboarding-data-line">
              <input type="radio" :value="JOB" v-model="templateForm.templateTrainingType" />실무 교육
            </div>
          </div>
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>제목</label>
            </div>
            <input type="text" v-model="templateForm.templateTitle" required/>
          </div>
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>서브내용</label>
            </div>
            <input type="text" v-model="templateForm.templateSub" required>
          </div>
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>URL입력</label>
            </div>
            <input type="text" required/>
          </div>
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>상세 내용</label>
            </div>
            <textarea v-model="templateForm.templateDetail"></textarea>
          </div>
        </div>

        <!-- TASK Form -->
        <div v-if="templateForm.templateType === 'TASK'">
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>공통 교육</label>
            </div>
            <div class="onboarding-data-line">
              <input type="radio" :value="COMMON" v-model="templateForm.templateTrainingType" />공통 교육
            </div>
            <div class="onboarding-data-line">
              <input type="radio" :value="JOB" v-model="templateForm.templateTrainingType" />실무 교육
            </div>
          </div>
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>차수</label>
            </div>
            <input
                v-model="templateForm.templateTaskRound"
                type="text"
                id="templateProcedure"
                required
                placeholder="차수를 입력해 주세요"
            />
            <p v-if="!isFormValid" style="color: red;">{{ errorMessage }}</p>

          </div>
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>제목</label>
            </div>
            <input type="text" v-model="templateForm.templateTitle" required/>
          </div>
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>서브내용</label>
            </div>
            <input type="text" v-model="templateForm.templateSub" required>
          </div>
        </div>

        <!-- QUIZ Form -->
        <div v-if="templateForm.templateType === 'QUIZ'">
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>제목</label>
            </div>
            <input type="text" v-model="templateForm.templateTitle" required/>
          </div>
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>서브내용</label>
            </div>
            <input type="text" v-model="templateForm.templateSub" required>
          </div>
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>퀴즈 카테고리</label>
            </div>
            <select v-model="templateForm.quizCategorySeq">
              <option v-for="category in quizCategories"
                      :key="category.quizCategorySeq"
                      :value="category.quizCategoryName">
                {{ category.quizCategoryName }}
              </option>
            </select>
          </div>
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>문제 개수</label>
            </div>
            <input type="text" v-model="templateForm.templateQuizQty">
          </div>
        </div>

        <div v-if="templateForm.templateType === 'BREAK' || templateForm.templateType === 'CF'">
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>제목</label>
            </div>
            <input type="text" v-model="templateForm.templateTitle" required/>
          </div>
          <div class="onboarding-data-line">
            <div class="onboarding-data-label">
              <label>서브내용</label>
            </div>
            <input type="text" v-model="templateForm.templateSub" required>
          </div>
        </div>



        <div class="onboarding-data-submit-container">
          <button type="submit" class="onboarding-data-submit">템플릿 저장</button>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
.form {
  width: 70%;
  padding: 30px;
  background: var(--white);
  border-radius: 0px 10px 10px 0px;
}
</style>
