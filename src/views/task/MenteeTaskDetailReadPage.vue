<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { downloadFile } from "@/services/FileApi.js";
import { formatDate, fetchTaskDetail, submitTask, formatContent } from '@/services/MenteeTaskDetailReadApi.js';
import "@/styles/task/MenteeTaskDetailReadPage.css"

// 컴포넌트 상태를 저장할 ref 변수
const taskDetail = ref({
  taskTitle: '',
  fileName: '',
  fileUrl: '',
  templateEndAt: null,
  taskContent: '',
});

const taskSubmitContent = ref(''); // 제출 내용 입력
const file = ref(null); // 업로드할 파일 정보
const uploadedFileName = ref(''); // 첨부된 파일 이름
const fileInput = ref(null); // 파일 input 요소를 참조할 ref

// URL에서 taskSeq를 가져오기 위해 useRoute 사용
const route = useRoute();
const taskSeq = route.params.taskSeq; // URL 파라미터에서 taskSeq를 가져옴

// 토큰을 헤더에 포함시키기 위한 함수
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken'); // 토큰을 localStorage에서 가져옴
  return {
    Authorization: `Bearer ${token}`,
  };
};

// 과제 세부사항 가져오기
onMounted(() => {
  fetchTaskDetail(taskSeq, taskDetail, getAuthHeader);
});

// 과제 제출 함수
const handleSubmitTask = async () => {
  if (!taskSubmitContent.value.trim()) {
    alert("과제 제출 내용을 입력해 주세요.");
    return;
  }

  try {
    // PUT 요청
    await submitTask(
        taskSeq,
        taskSubmitContent,
        file,
        uploadedFileName,
        getAuthHeader
    );

    alert("과제가 성공적으로 제출되었습니다!"); // 성공 메시지
    window.location.href = '/main'; // 메인 페이지로 이동
  } catch (error) {
    console.error("서버 요청 중 오류 발생:", error.response || error.message);
    alert("서버 요청 중 문제가 발생했습니다. 다시 시도해 주세요."); // 오류 메시지
  }
};


// 파일 첨부 버튼 클릭 시 input[type=file]을 클릭하도록 처리
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click(); // input[type=file] 클릭 이벤트 발생
  } else {
    console.error('fileInput 요소가 존재하지 않습니다.');
  }
};

// 파일 첨부 시 uploadedFileName에 파일 이름을 저장
const handleFileChange = (event) => {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    file.value = selectedFile;
    uploadedFileName.value = selectedFile.name; // 업로드된 파일 이름을 별도로 저장
  }
};
</script>

<template>
  <div class="task-detail-container">
    <div class="task-detail-header">
      과제
    </div>
    <div class="task-detail-body">
      <div class="task-detail-body-container">
        <div class="task-detail-body-header">
          {{ taskDetail.taskTitle }}
        </div>
        <div class="task-detail-body-url">
          <button v-if="taskDetail.fileUrl" @click="downloadFile(taskDetail.fileUrl, taskDetail.fileName)">
            🔗 {{ taskDetail.fileName }}
          </button>
        </div>
        <div class="task-detail-body-end">
          <p>마감일시 | {{ taskDetail.templateEndAt ? formatDate(taskDetail.templateEndAt) : '없음' }}</p>
        </div>
        <div class="task-detail-body-content">
          <p v-html="formatContent(taskDetail.taskContent)"></p>
        </div>
        <div class="bar3"></div>
        <div class="task-detail-body-sub">
          과제 제출
        </div>

        <input ref="fileInput" type="file" @change="handleFileChange" style="display: none"/>

        <textarea v-model="taskSubmitContent" placeholder="과제 제출 내용을 작성하세요" class="MenteeTaskDetailInputBox"></textarea>

        <div class="Mentee-task-detail-button">
          <div class="Mentee-task-detail-uploadButton-container">
            <button class="task-detail-sub-file-upload-button" @click="triggerFileInput">
              파일 업로드
            </button>
            <p v-if="uploadedFileName" class="Mentee-task-detail-uploadfile-name">첨부된 파일: {{ uploadedFileName }}</p>
          </div>
          <div class="Mentee-task-detail-sub-button-container">
            <button class="task-detail-sub-button" @click="handleSubmitTask">
              과제 제출
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>