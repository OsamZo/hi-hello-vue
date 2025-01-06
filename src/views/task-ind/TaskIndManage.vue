<template>
  <div class="taskInd-full-container">
    <div class="taskInd-header">평가 지표 관리</div>
    <div class="taskInd-container">
      <ListComponent :items="evalItems">
        <template #header class="taskInd-item-header">
          <div class="taskIndInd-header">
            <div class="taskInd-num-title">순서</div>
            <div class="taskInd-depart-title">항목</div>
            <div class="taskInd-round-title">배점</div>
          </div>
        </template>
        <template #item="{ item, index }">
          <div class="taskInd-item">
            <div class="taskInd-item-num">{{ index + 1 }}</div>
            <div class="taskInd-item-departmentName">{{ item.evalIndContent }}</div>
            <div class="taskInd-item-taskIndRound">{{ item.evalIndScore }}</div>
            <button @click="deleteItem(item.evalIndSeq)" class="taskInd-item-delete">삭제</button>
          </div>
        </template>
      </ListComponent>

      <!-- 긴 + 버튼을 클릭하면 새로운 입력 행이 추가되도록 -->
      <div v-if="isAdding" class="taskInd-item new-item">
        <div class="taskInd-item-container">
          <div class="taskInd-item-departmentName-input">
            <input
                type="text"
                v-model="newItem.evalIndContent"
                placeholder="항목 입력"
                required
                class="taskInd-input-name"
            />
          </div>
          <div class="taskInd-item-taskIndRound-input">
            <input
                type="number"
                v-model="newItem.evalIndScore"
                placeholder="배점 입력"
                min="1"
                required
                class="taskInd-input-score"
            />
          </div>
          <div class="taskIndAddButtonContainer">
            <button @click="addItem" class="taskIndAddButton">추가하기</button>
          </div>
        </div>
      </div>

      <!-- 항목 추가 버튼은 항상 맨 밑에 고정 -->
      <div class="taskInd-add-button-container">
        <button @click="toggleNewItem" class="taskInd-add-button">+ 항목 추가</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEvalItems } from '@/services/TaskIndManageApi.js'; // 새로 만든 파일에서 import
import ListComponent from '@/components/ListComponent.vue';
import '@/styles/task-Ind/TaskIndManage.css';
import {ref} from "vue";

let isAdding = ref(false);

// 긴 + 버튼 클릭 시 새로운 입력 행이 추가되도록 상태 변경
const toggleNewItem = () => {
  isAdding.value = !isAdding.value;
};

const { evalItems, newItem, addItem, deleteItem } = useEvalItems(); // 필요한 변수와 함수 사용
</script>
