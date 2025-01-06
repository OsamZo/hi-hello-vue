<script setup>
import "@/styles/task/MentorTaskDetailReadPage.css"
import WhiteBoxComponent from "@/components/WhiteBoxComponent.vue";
import {computed, onMounted, reactive, ref} from "vue";
import {fetchSubmittedTask, back} from "@/services/TaskApi.js";
import {useRoute, useRouter} from "vue-router";
import {fetchEvalLists} from "@/services/EvalListApi.js";
import {createTaskEval} from "@/services/TaskEvalApi.js";
import {downloadFile} from "@/services/FileApi.js";

const route = useRoute();
const router = useRouter();

const taskSeq = ref('');
const taskTitle = ref('');
const taskFileName = ref('');
const taskFileUrl = ref('');
const taskContent = ref('');
const taskSubmitContent = ref('');
const taskSubmitFileName = ref('');
const taskSubmitFileUrl = ref('');
const taskSubmitDate = ref('');
const taskEvalResultDetailList = reactive([]);

// 제출된 과제 내용 조회하기
const fetchingSubmittedTask = async(taskSubmitSeq) => {
  try {
    const response = await fetchSubmittedTask(taskSubmitSeq);

    taskSeq.value = response.data.taskSeq;
    taskTitle.value = response.data.taskTitle;
    taskFileName.value = response.data.taskFileName;
    taskFileUrl.value = response.data.taskFileUrl;
    taskContent.value = response.data.taskContent;
    taskSubmitContent.value = response.data.taskSubmitContent;
    taskSubmitFileName.value = response.data.taskSubmitFileName;
    taskSubmitFileUrl.value = response.data.taskSubmitFileUrl;
    taskSubmitDate.value = response.data.taskSubmitDate;
  } catch (error) {
    alert("과제가 제출되지 않았습니다.");
    window.location.href = '/main';
  }
}

// 과제 평가 항목 조회하기
const fetchingTaskEvalDetailResult = async (taskSeq) => {
    const response = await fetchEvalLists(taskSeq);

    taskEvalResultDetailList.splice(0, taskEvalResultDetailList.length); // 초기화
    response.data.data.forEach((taskEvalDetail) => {
      taskEvalResultDetailList.push({
        evalIndSeq: taskEvalDetail.evalIndSeq,
        evalIndContent: taskEvalDetail.evalIndContent,
        evalListSeq: taskEvalDetail.evalListSeq,
        evalListContent: taskEvalDetail.evalListContent,
        evalListScore: taskEvalDetail.evalListScore,
        taskScore: null
      });
    });

};

// 평가 지표 항목별로 그룹핑된 데이터 생성
const groupingTaskEvalDetailResult = computed(() => {
  const groups = [];

  if (!taskEvalResultDetailList.length) return groups; // 데이터가 없으면 빈 배열 반환

  taskEvalResultDetailList.forEach((item) => {
    const existingGroup = groups.find(
        (group) => group.evalIndContent === item.evalIndContent
    );
    if (existingGroup) {
      existingGroup.items.push(item);
    } else {
      groups.push({
        evalIndContent: item.evalIndContent,
        items: [item],
      });
    }
  });
  return groups;
});

const creatingTaskEvals = async() => {
  try {
    const taskSubmitSeq = route.params.taskSubmitSeq;
    const taskEvalsData = taskEvalResultDetailList.map(item => ({
      evalListSeq: item.evalListSeq,
      taskScore: item.taskScore
    }))

    await createTaskEval(taskSubmitSeq, taskEvalsData);
    alert("과제 평가가 성공적으로 등록되었습니다.");
    await router.push('/task-eval');
  } catch(error) {
    alert("과제 평가 등록 중 오류가 발생했습니다.");
  }
}

onMounted(async() => {
  const taskSubmitSeq = route.params.taskSubmitSeq;
  await fetchingSubmittedTask(taskSubmitSeq);
  await fetchingTaskEvalDetailResult(taskSeq.value);
})
</script>

<template>
  <div class="page-container">
    <div class="page-title">과제</div>
    <WhiteBoxComponent class="white-box-component">
      <div class="left">
        <div class="task-info-container">
          <div class="mentor-task-page-title">{{ taskTitle }}</div>
          <div class="flex">
            <div class="task-file-text">과제 파일</div>
            <div class="task-file-name-container flex" @click="downloadFile(taskFileUrl, taskFileName)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-tags-fill" viewBox="0 0 16 16">
                <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                <path d="M1.293 7.793A1 1 0 0 1 1 7.086V2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l.043-.043z"/>
              </svg>
              <div class="mentor-task-detail-task-file-name">{{ taskFileName }}</div>
            </div>
          </div>
          <div class="left mentor-task-content">{{ taskContent }}</div>
        </div>
        <hr class="light-gray-hr">
        <div class="mentor-task-submit-container">
          <div class="mentor-task-page-title">과제 제출</div>
          <div v-if="taskSubmitFileUrl !== null" class="flex">
            <div class="task-file-text">제출 파일</div>
            <div class="task-file-name-container"  @click="downloadFile(taskSubmitFileUrl, taskSubmitFileName)">
              <div class="mentor-task-detail-task-file-name">🔗 {{ taskSubmitFileName }}</div>
            </div>
          </div>
          <div class="mentor-task-detail-read-task-submit-content">{{ taskSubmitContent }}</div>
        </div>
        <hr class="light-gray-hr">
        <div class="mentor-eval-container">
          <div class="mentor-task-page-title">멘토 평가</div>
          <table class="mentor-task-eval-table">
            <colgroup>
              <col style="width: 15%;">
              <col style="width: 54%;">
              <col style="width: 10%;">
            </colgroup>
            <thead>
            <tr>
              <th>평가 지표</th>
              <th>평가 항목</th>
              <th>점수</th>
            </tr>
            </thead>
            <tbody>
            <template v-if="groupingTaskEvalDetailResult.length > 0">
              <template
                  v-for="(group, groupIndex) in groupingTaskEvalDetailResult"
                  :key="'group-' + groupIndex"
              >
                <tr v-for="(item, index) in group.items" :key="'item-' + groupIndex + '-' + index">
                  <td v-if="index === 0" :rowspan="group.items.length">
                    {{ group.evalIndContent }}
                  </td>
                  <td>{{ item.evalListContent }}</td>
                  <td>
                    <input
                        type="text"
                        class="task-eval-score-input"
                        :placeholder="item.evalListScore"
                        v-model.muber = "item.taskScore"
                    >점
                  </td>
                </tr>
              </template>
            </template>
            <tr v-else>
              <td colspan="3">데이터가 없습니다.</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="mentor-task-detail-button-box">
        <button class="mentor-task-detail-cancel-button" @click="back">뒤로가기</button>
        <button class="mentor-task-detail-read-purple-button" @click="creatingTaskEvals">평가하기</button>
      </div>
    </WhiteBoxComponent>
  </div>
</template>