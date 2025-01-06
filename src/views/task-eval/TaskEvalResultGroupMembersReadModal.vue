<script setup>
import {fetchTaskGroupMembers} from "@/services/GroupingApi.js";
import {onMounted, reactive, watch} from "vue";
const taskGroupMemberList = reactive([]);

const fetchingTaskGroupMembers = async(taskSubmitSeq) => {
  try {
    taskGroupMemberList.length = 0;
    const response = await fetchTaskGroupMembers(taskSubmitSeq);
    // console.log(response)
    response.data.data.forEach((taskGroupMember) => {
      taskGroupMemberList.push({
        employeeNum: taskGroupMember.employeeNum,
        employeeName: taskGroupMember.employeeName
      })
    })
  } catch(error) {
    alert("제출된 그룹 과제의 그룹 멤버를 조회하던 도중 오류가 발생했습니다.");
  }
}

// Props 정의
const props = defineProps({
  isModalOpen: Boolean,
  taskSubmitSeq: Number
});

onMounted(async()=> {
  await fetchingTaskGroupMembers(props.taskSubmitSeq);
})
</script>

<template>
  <div class="group-member-container">
    <div v-for="member in taskGroupMemberList" class="group-member-row">
      <div>{{ member.employeeNum }}</div>
      <div>{{ member.employeeName }}</div>
    </div>
  </div>
</template>

<style scoped>
.group-member-container {
  width: 10rem;
  padding: 1rem;
  background-color: var(--light-purple);
  border-radius: 10px;
  position: absolute;
  top: 0.1rem;
  left: 12rem;
}

.group-member-row {
  display: flex;
  margin: 0.5rem;
}

.group-member-row div:first-child {
  margin-right: 0.3rem;
}
</style>