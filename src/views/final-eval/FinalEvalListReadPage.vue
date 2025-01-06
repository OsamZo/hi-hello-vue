<script setup>
import "@/styles/final-eval/FinalEvalListPage.css"
import {onMounted, reactive, ref, watch} from "vue";
import {fetchFinalEvalResultList, searchFinalEvalResultList} from "@/services/FinalEvalApi.js";

import WhiteBoxComponent from "@/components/WhiteBoxComponent.vue";
import ListComponent from "@/components/ListComponent.vue";
import SearchBarComponent from "@/components/SearchBarComponent.vue";
import router from "@/router/index.js";

const finalEvalResultList = reactive([]);
const searchedFinalEvalResultList = reactive([]);
const isSearching = ref(false);

const fetchingFinalEvalResultList = async() => {
  try {
    const response = await fetchFinalEvalResultList();

    response.data.data.forEach(finalEval => {
      finalEvalResultList.push({
        employeeSeq: finalEval.employeeSeq,
        employeeNum: finalEval.employeeNum,
        employeeName: finalEval.employeeName,
        departmentName: finalEval.departmentName,
        totalFinalEvalScore: parseFloat(finalEval.totalFinalEvalScore.toFixed(2))
      })
    })
  } catch(error) {
    alert("최종 평가 결과 리스트를 조회하던 도중 오류가 발생했습니다.");
  }
}

const searchingFinalEvalResultList = async(keyword) => {
  try {
    if (!keyword) {
      isSearching.value = false; // 검색어가 없으면 전체 리스트 표시
      alert("검색어를 입력해주세요.");
      return;
    }

    searchedFinalEvalResultList.length = 0;

    const response = await searchFinalEvalResultList(keyword);

    response.data.data.forEach(finalEval => {
      searchedFinalEvalResultList.push({
        employeeSeq: finalEval.employeeSeq,
        employeeNum: finalEval.employeeNum,
        employeeName: finalEval.employeeName,
        departmentName: finalEval.departmentName,
        totalFinalEvalScore: parseFloat(finalEval.totalFinalEvalScore.toFixed(2))
      })
    })

    isSearching.value = true;
  } catch(error) {
    alert("최종 평가 결과 리스트를 검색하던 도중 오류가 발생했습니다.");
  }
}

const navigateToFinalEvalDetail = (employeeSeq) => {
  router.push(`/final-eval/${employeeSeq}`);
}

onMounted(() => {
  fetchingFinalEvalResultList();
})
</script>

<template>
  <div class=" final-eval-result-list">
  <div class=" page-container">
    <div class="page-title">최종 평가 조회</div>
    <SearchBarComponent @search="searchingFinalEvalResultList"/>
    <WhiteBoxComponent class="white-box-component">
      <ListComponent :items="isSearching ? searchedFinalEvalResultList : finalEvalResultList">
        <template #header>
          <div class="content-header">
            <div>사번</div>
            <div>성명</div>
            <div>부서</div>
            <div>평가(환산점수)</div>
            <div/>
          </div>
        </template>
        <template #item="{item}">
          <div class="content-items">
            <div>{{ item.employeeNum }}</div>
            <div>{{ item.employeeName }}</div>
            <div>{{ item.departmentName }}</div>
            <div>{{ item.totalFinalEvalScore }}</div>
            <div>
              <button class="final-eval-result-read-button" @click="navigateToFinalEvalDetail(item.employeeSeq)">조회</button>
            </div>
          </div>
        </template>
      </ListComponent>
    </WhiteBoxComponent>
  </div>
  </div>
</template>