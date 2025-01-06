<script setup>
import router from "@/router/index.js";
import {ref} from "vue";
import {updatePassword} from "@/services/UserApi.js";
import {useUserStore} from "@/stores/UserStore.js";

const route = router;

const employeePassword = ref('');
const employeeNewPwd = ref('');
const checkEmployeeNewPwd = ref('');

const employeeSeq = useUserStore().getEmployeeInfo().employeeSeq;

const handleSubmit = async () => {
  if (!employeePassword.value || !employeeNewPwd.value || !checkEmployeeNewPwd.value) {
    alert('입력 란에 모두 입력해주세요.');
    return;
  }

  try {
    const response = await updatePassword(employeeSeq, {
      employeePassword: employeePassword.value,
      employeeNewPwd: employeeNewPwd.value,
      checkEmployeeNewPwd: checkEmployeeNewPwd.value
    });

    // console.log(response);
    if (!response.success) {
      throw new Error(JSON.stringify(response));
    }

    alert('비밀번호가 변경되었습니다.');
    await route.back();

  } catch (error) {
    try {
      const errorResponse = JSON.parse(error.message);
      // console.log(errorResponse);
      const errorMessage = errorResponse.message || '비밀번호 변경 도중 오류가 발생하였습니다.';

      alert(`${errorMessage}`);

    } catch (parseError) {
      alert('비밀번호 변경 도중 오류가 발생하였습니다.');
    }
    location.reload();
  }
};

const handleCancel = () => {
  route.back();
}

</script>

<template>
  <div class="container">

    <h3>비밀번호 수정</h3>
    <form class="input-form" @submit.prevent="handleSubmit">
      <div class="input-group">
        <label for="currentPassword">현재 비밀번호</label>
        <input type="password"
               id="currentPassword"
               v-model="employeePassword"/>
      </div>
      <div class="input-group">
        <label for="newPassword">변경 비밀번호</label>
        <input type="password"
               id="newPassword"
               v-model="employeeNewPwd"/>
      </div>
      <div class="input-group">
        <label for="confirmPassword">변경 비밀번호 확인</label>
        <input type="password"
               id="confirmPassword"
               v-model="checkEmployeeNewPwd"/>
      </div>
      <div class="button-group">
        <button type="submit" class="submit-button">수정</button>
        <button type="button" class="cancel-button" @click="handleCancel">취소</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.container {
  width: 400px;
  margin: auto;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: var(--white);
  justify-content: center;
  align-items: center;

}

h3 {
  text-align: center;
  margin-bottom: 20px;
}

.input-form {
  width: 70%;
  margin-left: auto;
  margin-right: auto;
}

.input-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 95%;
  height: 8px;
  padding: 10px;
  border: 1px solid var(--light-gray);
  border-radius: 5px;
}

.button-group {
  display: flex;
  justify-content: center;
}

.submit-button {
  background-color: var(--purple);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
  margin-right: 5px;
}

.cancel-button {
  background-color: var(--light-gray);
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
  margin-left: 5px;
}
</style>