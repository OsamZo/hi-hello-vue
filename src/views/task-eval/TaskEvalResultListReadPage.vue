<script setup>
import WhiteBoxListComponent from "@/components/WhiteBoxListComponent.vue";
import ListComponent from "@/components/ListComponent.vue";

import '@/styles/task-eval/TaskEvalResultDetailReadModal.css'

import {onMounted, reactive, ref} from "vue";
import {fetchTaskEvalResultList} from "@/services/TaskEvalResultApi.js";
import TaskEvalResultDetailReadModal from "@/views/task-eval/TaskEvalResultDetailReadModal.vue";
import {useUserStore} from "@/stores/UserStore.js";
import router from "@/router/index.js";

const userStore = useUserStore();
const employeeInfo = userStore.getEmployeeInfo();
const employeeRole = employeeInfo.employeeRole[0];

const employeePosition = employeeInfo.employeePositionName;

const taskEvalResultList = reactive([]);
const taskInfo = ref({});
const isModalOpen = ref(false);

const fetchingTaskEvalResultList = async () => {
  try {
    const response = await fetchTaskEvalResultList();

    response.data.data.forEach(taskEvalResult => {
      taskEvalResultList.push({
        departmentName: taskEvalResult.departmentName,
        templateTaskRound: taskEvalResult.templateTaskRound,
        taskSubmitSeq: taskEvalResult.taskSubmitSeq,
        taskType: taskEvalResult.taskType,
        submitterName: taskEvalResult.submitterName,
        taskContent: taskEvalResult.taskContent,
        taskTotalScore: taskEvalResult.taskTotalScore
      })
    })
  } catch (error) {
    alert("과제 평가 결과 리스트를 조회하던 도중 오류가 발생했습니다.");
  }
}

const openTaskResultDetailModal = (task) => {
  taskInfo.value = task;
  isModalOpen.value = true;
}

const closeTaskResultDetailModal = () => {
  isModalOpen.value = false;
  taskInfo.value = {};
}

const navigateToTaskEval = (taskSubmitSeq) => {
  router.push(`/task-submit/${taskSubmitSeq}`)
}

onMounted(async () => {
  await fetchingTaskEvalResultList();
})
</script>

<template>
  <div class="task-eval-result-list-container">
    <div class="page-title">과제 평가 조회</div>
    <WhiteBoxListComponent class="white-box-list-component">
      <ListComponent :items="taskEvalResultList">
        <template #header>
          <div class="task-eval-result-list-header">
            <div class="department-name">과제 부서</div>
            <div class="template-task-round">과제 지정</div>
            <div class="submitter-name">제출자</div>
            <div class="task-content-header-container">과제 내용</div>
            <div class="task-total-score">평가</div>
          </div>
        </template>
        <template #item="{ item }">
          <div class="task-eval-result-list-row-container" @click="openTaskResultDetailModal(item)">
            <div class="department-name">{{ item.departmentName }}</div>
            <div class="template-task-round">{{ item.templateTaskRound }}</div>
            <div class="submitter-name">{{ item.submitterName }}</div>
            <div class="task-content-container">{{ item.taskContent }}</div>
            <div class="task-total-score">
              <div v-if="item.taskTotalScore !== null" class="task-eval-score">
              {{ item.taskTotalScore }}점
              </div>
              <div v-else-if="employeeRole === 'HR' || employeePosition === '팀장'" class="task-eval-score">
              평가 전
              </div>
              <button
                  v-else-if="employeeRole === 'MENTOR'"
                  class="eval-button"
                  @click="navigateToTaskEval(item.taskSubmitSeq)"
              >
                평가하기
              </button>
              <TaskEvalResultDetailReadModal
                  :isOpen="isModalOpen"
                  :taskData="taskInfo"
                  @close="closeTaskResultDetailModal"/>
            </div>
          </div>
        </template>
      </ListComponent>
    </WhiteBoxListComponent>
  </div>
</template>

<style scoped>
.task-eval-result-list-container {
  width: 70vw;
}

.page-title {
  font-size: 30px;
  font-weight: bold;
  text-align: center;
  margin: 105px 0px 49px 0px;
}

.white-box-list-component {
  min-width: 750px;
}

.task-eval-result-list-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  cursor: pointer;
}

.task-eval-result-list-row-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  cursor: pointer;
  margin: 0 20px;
}

.department-name {
  width: 10%;
  display: flex;
  justify-content: center;
}

.template-task-round {
  width: 10%;
  display: flex;
  justify-content: center;
}

.submitter-name {
  width: 8%;
  display: flex;
  justify-content: center;
}

.task-content-header-container {
  display: flex;
  width: 40%;
  justify-content: center;
  max-width: 300px;
}

.task-content-container {
  width: 40%;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
  display: block;
}

.task-total-score {
  width: 3rem;
  height: 2.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.task-eval-score {
  width: 1000px;
  text-align: center;
}

.eval-button {
  width: 100rem;
  height: 30px;
  font-size: 15px;
  color: var(--white);
  background-color: var(--purple);
  border: transparent;
  border-radius: 10px;
  cursor: pointer;
}

.eval-button:hover {
  background-color: var(--dark-purple);
}
</style>