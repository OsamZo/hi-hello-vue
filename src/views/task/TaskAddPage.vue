<script setup>
import '@/styles/task/TaskAddPage.css'
import { ref, onMounted } from 'vue';
import { useTask } from '@/services/TaskAddApi.js';

const {
  taskType,
  fileName,
  tableData,
  taskSubmitSeq,
  isLoading,
  taskTitle,
  taskContent,
  round,
  departmentSeq,
  departments,
  taskRounds,
  templateSeq,
  back,
  fetchDepartments,
  handleFileChange,
  fetchData,
  deleteRow,
  addRow,
  submitTask,
  goToGroupingPage,
  fetchTaskRounds
} = useTask();

onMounted(() => {
  fetchDepartments();
  fetchTaskRounds();  // 새로운 호출
  fetchData(); // 기존 데이터도 가져옴
});
</script>

<template>
  <div class="task-add-page-container">
  <div class="taskAddHeader">
    <div class="header-title">
      과제 등록
    </div>
  </div>
  <div class="taskAddBody">
    <div class="taskAddContainer">
      <div class="container-line">
        <span class="task-name"> 과제 제목 </span>
        <input v-model="taskTitle" class="task-name-input">
      </div>
      <div class="container-line">
        <span class="task-depart">과제 부서</span>
        <select v-model="departmentSeq" id="departmentSelect" class="task-depart-input">
          <option v-for="department in departments"
                  :key="department.departmentSeq"
                  :value="department.departmentSeq">
            {{ department.departmentName || '부서 없음' }}
          </option>
        </select>
      </div>
      <div class="container-line">
        <span class="task-round">과제 지정</span>
        <select v-model="templateSeq" class="task-round-input">
          <option v-if="taskRounds.length === 0" disabled>
            템플릿 없음
          </option>
          <option v-for="taskRound in taskRounds"
                  :key="taskRound.templateSeq"
                  :value="taskRound.templateSeq">
            {{ taskRound.templateTaskRound || '차수 없음'}}
          </option>
        </select>
      </div>
      <div class="container-line">
        <span class="task-type">과제 유형</span>
        <select v-model="taskType" class="task-type-input">
          <option value="PERSONAL">개인과제</option>
          <option value="GROUP">그룹과제</option>
        </select>
        <button v-if="taskType === 'GROUP'" class="task-group-button" @click="goToGroupingPage">
          그룹 매칭
        </button>
      </div>
      <div class="container-line">
        <span class="task-content"> 과제 내용 </span>
        <textarea v-model="taskContent" class="task-content-input"/>
      </div>
      <div class="container-line">
        <span class="task-attach"> 과제 참고 자료 </span>
        <input
            id="fileInput"
            class="task-attach-input"
            type="file"
            @change="handleFileChange"
        >
        <label for="fileInput" class="file-upload-label">파일 선택</label>
        <span v-if="fileName" class="file-name">{{ fileName }}</span> <!-- 파일 이름을 표시하는 부분 -->
      </div>
      <div class="table-container">
        <div class="table-detail">
          <table>
            <thead>
            <tr>
              <td :rowspan="tableData.length + 1" class="evalList">평가 항목</td>
            </tr>
            <tr v-for="(item, index) in tableData" :key="index">
              <td class="taskAddEvalsub">{{ item.evalIndContent }}</td>
              <td>
                <input v-model="item.evalListContent" placeholder="내용을 입력하세요" class="evalContent"/>
              </td>
              <td>
                <input v-model="item.evalListScore" type="number" placeholder="점수" min="0" class="evalscore"/>
              </td>
              <td class="TaskAddButtonBox">
                <button @click="addRow(index)" class="evalButton">추가</button>
                <button @click="deleteRow(index)" class="evalButton-delete">삭제</button>
              </td>
            </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
      <div class="submitButton-container">
        <button @click="back" class="task-submit-cancel">뒤로 가기</button>
        <button @click="submitTask" class="task-submit-button">과제 등록</button>
      </div>
  </div>
  </div>
</template>
