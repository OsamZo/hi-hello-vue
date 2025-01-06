<script setup>
import { onMounted } from 'vue';
import { useTask } from "@/services/TaskListApi.js";
import SearchBarComponent from "@/components/SearchBarComponent.vue";
import AddTask from "@/components/AddTask.vue";
import UserRollRectangle from "@/components/UserRollRectangle.vue";
import ListComponent from "@/components/ListComponent.vue";
import DeleteModalComponent from "@/components/DeleteModalComponent.vue";
import "@/styles/task/TaskListPage.css";

import { useRouter } from 'vue-router';

const router = useRouter();

const goToModify = (taskSeq) => {
  if (!taskSeq) {
    alert("잘못된 과제 번호입니다.");
    return;
  }
  router.push(`/task/modify/${taskSeq}`); // taskSeq를 URL에 포함
};

const {
  searchQuery,
  taskItems,
  selectedTaskSeq,
  deleteMessage,
  isDeleteModalVisible,
  formattedTitle,
  fetchTasks,
  handleSearch,
  formatDeleteMessage,
  openDeleteModal,
  deleteTask,
  employeeRole,
} = useTask();

onMounted(() => {
  fetchTasks();
});
</script>

<template>
  <div class="task-list-page-container">
  <div class="header-task">
    <div class="title">과제 목록</div>
    <div class="search-bar-task">
      <SearchBarComponent @search="handleSearch"/>
      <AddTask buttonText="과제 등록" :targetPage="'/task/add'" class="add-task" />
    </div>
  </div>
  <div class="TaskListbody">
    <ListComponent :items="taskItems">
      <template #header>
        <div class="task-header">
          <div class="task-num-title">과제 번호</div>
          <div class="task-depart-title">과제 부서</div>
          <div class="task-round-title">과제 지정</div>
          <div class="task-name-title">과제 제목</div>
          <div class="task-title-box"/>
        </div>
      </template>

      <template #item="{ item, index }">
        <div class="list-item">
          <div class="list-item-num">{{ index + 1 }}</div>
          <div class="list-item-departmentName">{{ item.departmentName }}</div>
          <div class="list-item-taskRound">{{ item.templateTaskRound }}</div>
          <div class="list-item-title">{{ item.title }}</div>
          <div class="list-button">
            <button class="list-button-revise" @click="goToModify(item.seq)">수정</button>
            <button class="list-button-delete" @click="openDeleteModal(item.seq, item.departmentName, item.templateTaskRound, item.title)">삭제</button>
            <DeleteModalComponent
                :visible="isDeleteModalVisible"
                :title="formattedTitle"
                :message="formatDeleteMessage(deleteMessage)"
                confirmText="삭제"
                cancelText="취소"
                @close="isDeleteModalVisible = false"
                @confirm="deleteTask"
            />
          </div>
        </div>
      </template>
    </ListComponent>
  </div>
  </div>
</template>
