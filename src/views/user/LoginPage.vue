<template>
    <div class="login-page">
        <WhiteBox>
            <h2 class="login-title">로그인</h2>
            <form class="login-form" @submit.prevent="onLogin">
                <div class="login-form-group">
                    <label for="username">사번</label>
                    <input type="text" id="username" v-model="employee_num" placeholder="사번을 입력하세요" />
                </div>
                <div class="login-form-group">
                    <label for="password">비밀번호</label>
                    <input type="password" id="password" v-model="employee_password" placeholder="비밀번호를 입력하세요" />
                </div>
                <button type="submit" class="login-button">로그인</button>
            </form>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </WhiteBox>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/UserStore';
import WhiteBox from '@/components/WhiteBoxComponent.vue';
import { useRouter } from 'vue-router';
import '@/styles/user/LoginPage.css';

const router = useRouter();
const userStore = useUserStore();

const employee_num = ref('');
const employee_password = ref('');
const errorMessage = ref('');

const onLogin = async () => {
    const success = await userStore.login(employee_num.value, employee_password.value);
    if (!success) {
        errorMessage.value = '로그인에 실패했습니다. 사번과 비밀번호를 확인하세요.';
    } else {
      errorMessage.value = '';

      const employeeInfo = userStore.getEmployeeInfo();
      const employeeRole = employeeInfo.employeeRole[0];
      const positionName = employeeInfo.employeePositionName;

      if (employeeRole === 'HR') {
        await router.push('/employee-management');
      } else if (employeeRole === 'MENTOR' || employeeRole === 'MENTEE') {
        await router.push('/main');
      } else if (positionName === '팀장') {
        await router.push('/mentoring/planning');
      }
    }
};
</script>

<style scoped>
.white-box{
    width: 35vw;
    padding: 3vw;
}
</style>
