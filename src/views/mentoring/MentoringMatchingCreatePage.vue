<script setup>
import { ref, onMounted } from 'vue';
import { fetchDepartmentList, fetchMenteeByDepartment, fetchMentorsByDepartment, createMentoringGroup } from '@/services/MentoringApi.js';
import WhiteBoxComponent from "@/components/WhiteBoxComponent.vue";

const departments = ref([]);
const mentors = ref([]);
const mentees = ref([]);
const selectedDepartment = ref(null);
const mentoringGroups = ref([]);
const selectedMentees = ref(new Set()); // 선택된 멘티 관리
const error = ref(null);

const fetchDepartments = async () => {
  try {
    const response = await fetchDepartmentList();
    departments.value = response.data.data || [];
  } catch (e) {
    console.error('부서 조회 실패:', e);
  }
};

const fetchMentors = async (departmentSeq) => {
  try {
    const response = await fetchMentorsByDepartment(departmentSeq);
    mentors.value = response.data.data || [];
  } catch (e) {
    console.error('멘토 조회 실패:', e);
    error.value = "멘토 데이터를 불러오는 데 실패했습니다.";
  }
};

const fetchMentees = async (departmentSeq) => {
  try {
    const response = await fetchMenteeByDepartment(departmentSeq);
    mentees.value = response.data.data || [];
  } catch (e) {
    // console.error('멘티 조회 실패', e);
    error.value = "멘티 데이터를 불러오는 데 실패했습니다.";
  }
};

onMounted(async () => {
  await fetchDepartments();
  if (departments.value.length > 0) {
    const firstDepartment = departments.value[0];
    selectedDepartment.value = firstDepartment.departmentSeq;
    fetchMentors(firstDepartment.departmentSeq);
    fetchMentees(firstDepartment.departmentSeq);
  }
});

const handleDepartmentClick = (departmentSeq) => {
  selectedDepartment.value = departmentSeq;
  fetchMentors(departmentSeq);
  fetchMentees(departmentSeq);
};

const assignMenteeToMentor = (mentorSeq, menteeSeq) => {
  if (!menteeSeq) return;
  mentoringGroups.value.forEach(group => {
    if (group.menteeSeq === menteeSeq) {
      selectedMentees.value.delete(group.menteeSeq);
      group.menteeSeq = null;
    }
  });

  const group = mentoringGroups.value.find(group => group.mentorSeq === mentorSeq);
  if (group) {
    if (group.menteeSeq) selectedMentees.value.delete(group.menteeSeq);
    group.menteeSeq = menteeSeq;
  } else {
    mentoringGroups.value.push({ mentorSeq, menteeSeq });
  }

  selectedMentees.value.add(menteeSeq);
};

const saveMentoringGroups = async () => {
  try {
    const response = await createMentoringGroup(mentoringGroups.value);
    alert('멘토-멘티 매칭이 성공적으로 등록되었습니다.');
  } catch (e) {
    console.error('매칭 저장 실패:', e);
    alert('매칭 저장에 실패했습니다.');
  }
};

</script>

<template>
  <div class="content-box">
    <div class="mentor-mentee-matching-page">멘토-멘티 매칭</div>
    <div>
      <ul class="department-list">
        <li
            v-for="department in departments"
            :key="department.departmentSeq"
            class="department-item"
            @click="handleDepartmentClick(department.departmentSeq)"
            :class="{ 'selected': department.departmentSeq === selectedDepartment }"
        >
          {{ department.departmentName }}
        </li>
      </ul>
    </div>

    <!-- 멘토 목록 불러오기 -->
    <div class="white-container">
      <WhiteBoxComponent>
        <div v-if="mentors.length === 0" class="no-data">
          선택한 부서에 멘토가 없습니다.
        </div>
        <div v-if="mentors.length > 0">
          <div>{{ departments.find(d => d.departmentSeq === selectedDepartment)?.departmentName }} 부서의 멘토 목록</div>
          <div class="inline">
            <div>멘토</div>
            <div>멘티</div>
          </div>
          <ul class="mentor-list">
            <li v-for="mentor in mentors" :key="mentor.employeeSeq" class="mentor-item">
              <div class="mentors-name">{{ mentor.employeeName }} ({{ mentor.employeeNum }})</div>
              <div>
                <select :id="'mentees-select-' + mentor.employeeSeq" class="click"
                        @change="assignMenteeToMentor(mentor.employeeSeq, $event.target.value)">
                  <option value="">멘티를 지정하세요</option>
                  <option v-for="mentee in mentees" :key="mentee.employeeSeq" :value="mentee.employeeSeq" :disabled="selectedMentees.has(mentee.employeeSeq)">
                    {{ mentee.employeeName }}/({{ mentee.employeeNum }})
                  </option>
                </select>
              </div>
            </li>
          </ul>
        </div>
        <!-- 저장 버튼 -->
        <div v-if="mentors.length > 0">
          <button @click="saveMentoringGroups" class="submit">저장</button>
        </div>
      </WhiteBoxComponent>
    </div>
  </div>
</template>

<style scoped>
.mentor-mentee-matching-page{
  margin-bottom: 49px;
  margin-top: 105px;
  font-size: 30px;
  font-weight: 700
}
.submit{
  margin-top: 20px;
  box-shadow: 2px 2px 4px 0px rgba(0, 0, 0, 0.25);
  background-color: var(--purple);
  height: 33px;
  width: 50%;
  color: var(--white);
  border-radius: 10px;
  font-weight: 700;
  font-size: 20px;
  border: none;
}
.white-container{
  width: 800px;
}
.click{
  background-color: var(--ivory);
  border-radius: 10px;
  height: 33px;
  border: none;
}
.inline{
  display: flex;
  justify-content: space-around;
  border-bottom: 2px solid var(--gray);
  padding-bottom: 5px;
  padding-top: 20px;
}
.content-box {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}
.selected {
  background-color: var(--purple);
  color: white;
}
.department-list {
  list-style-type: none;
  display: flex;
  gap: 10px;
}

.department-item {
  padding: 5px 10px;
  margin-bottom: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
.department-item:hover {
  background-color: var(--yellow);
}

.mentor-list {
  list-style-type: none;
}
.mentor-item {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-around;
}
.no-data {
  color: var(--gray);
  font-size: 16px;
}
</style>
