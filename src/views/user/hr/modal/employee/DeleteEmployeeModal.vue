<script setup>
const props = defineProps({
  employee: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close-modal', 'delete-employee']);

const closeModal = () => {
  emit('close-modal');
}

const isDelete = () => {
  emit('delete-employee');
}


</script>

<template>
  <div class="confirmation-container">
    <h2 class="confirmation-title">해당 사원을 삭제하시겠습니까?</h2>
    <div class="info-group">
      <div class="info-row">
        <div class="info">사번</div>
        <div class="info-value">{{ employee.employeeNum}}</div>
      </div>
      <div class="info-row">
        <div class="info">부서</div>
        <div class="info-value">{{ employee.departmentName }}</div>
      </div>
      <div class="info-row">
        <div class="info">직급</div>
        <div class="info-value">{{ employee.positionName}}</div>
      </div>
      <div class="info-row">
        <div class="info">이름</div>
        <div class="info-value">{{ employee.employeeName }}</div>
      </div>
    </div>
    <div class="button-group">
      <button class="delete-button" @click="isDelete">삭제</button>
      <button class="cancel-button" @click="closeModal">취소</button>
    </div>
  </div>
</template>

<style scoped>
.confirmation-container {
  padding: 20px;
  border-radius: 10px;
  background-color: var(--white);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  justify-items: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.confirmation-title {
  font-size: 20px;
  font-weight: bold;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.info-group {
  width: 70%;
  margin-bottom: 20px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.info-row {
  display: flex;
  justify-content: left;
  margin-bottom: 10px;
}

.info {
  width: 40px;
  font-weight: bold;
}

.info-value {
  margin-left: 30px;
}

.button-group {
  justify-content: center;
  align-self: center;
  width: 100%;
}

.delete-button {
  width: 40%;
  background-color: var(--purple);
  color: var(--white);
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
  margin-right: 5px;
}

.cancel-button {
  width: 40%;
  background-color: var(--light-gray);
  color: var(--black);
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
  margin-left: 5px;
}
</style>