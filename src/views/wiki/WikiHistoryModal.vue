<script setup>
import {fetchWikiByWikiModContentSeq, fetchWikiHistory} from "@/services/WikiApi.js";
import {onMounted, reactive} from "vue";
import {useRoute} from "vue-router";
import router from "@/router/index.js";

const route = useRoute();
const wikiHistoryList = reactive([]);

const fetchingWikiHistory = async(wikiSeq) => {
  try {
    const response = await fetchWikiHistory(wikiSeq);

    response.data.forEach(wikiHistory => {
      wikiHistoryList.push({
        editorNum: wikiHistory.employeeNum,
        editorName: wikiHistory.employeeName,
        wikiModContentSeq: wikiHistory.wikiModContentSeq,
        latestModDate: wikiHistory.regDate
      })
    })
  } catch(error) {
    alert("위키 히스토리 리스트를 조회하던 도중 오류가 발생했습니다.");
  }
}

const formattingDateTime = (dateTime) => {
  return dateTime.replace("T", " ");
}

const navigateToRestoredWiki = async(wikiModContentSeq) => {
  const wikiSeq = props.wikiSeq;
  closeModal();
  await router.push(`/wiki/${wikiSeq}/ver/${wikiModContentSeq}`);
  await fetchWikiByWikiModContentSeq(wikiSeq, wikiModContentSeq);
}

const props = defineProps({
  wikiSeq: {
    type: [String, Number],
    required: true
  }
})

// Emit 정의
const emit = defineEmits(["close"]);

// 모달 닫기
const closeModal = () => {
  emit("close");
};

onMounted(async() => {
  const wikiSeq = route.params.wikiSeq;
  await fetchingWikiHistory(wikiSeq);
})
</script>

<template>
  <div class="wiki-history-container">
    <div v-for="wikiHistory in wikiHistoryList" :key="wikiHistory.wikiModContentSeq" class="wiki-history">
      <div class="white-space-no-wrap">{{ formattingDateTime(wikiHistory.latestModDate) }}</div>
      <div class="white-space-no-wrap">{{ wikiHistory.editorNum }}</div>
      <div class="white-space-no-wrap">{{ wikiHistory.editorName }}</div>
      <button class="purple-button" @click="navigateToRestoredWiki(wikiHistory.wikiModContentSeq)">보기</button>
    </div>
  </div>
</template>

<style scoped>
.wiki-history-container {
  width: 26rem;
  height: 32rem;
  background-color: var(--white);
  opacity: 90%;
  border-radius: 10px;
  border: 1px solid var(--light-gray);
  margin-top: 0.5rem;
  overflow: auto;
  position: absolute;
  left: 60%;
  z-index: 1000;
}

.wiki-history {
  display: flex;
  align-items: center;
  margin: 2rem;
}

.wiki-history > div:first-child {
  margin-right: 1.2rem;
}

.purple-button {
  width: 3.5rem;
  height: 1.8rem;
  background-color: var(--purple);
  border: transparent;
  border-radius: 10px;
  margin-left: 1rem;
  color: var(--white);
  cursor: pointer;
}

.purple-button:hover {
  background-color: var(--dark-purple);
}

.white-space-no-wrap {
  white-space: nowrap;
}
</style>