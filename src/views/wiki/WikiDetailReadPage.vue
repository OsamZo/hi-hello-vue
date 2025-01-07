<script setup>
import {onMounted, ref, watch, watchEffect} from "vue";
import {deleteWiki, fetchWiki, fetchWikiByWikiModContentSeq} from "@/services/WikiApi.js";
import {useRoute} from "vue-router";
import WhiteBoxListComponent from "@/components/WhiteBoxListComponent.vue";
import WikiHistoryModal from "@/views/wiki/WikiHistoryModal.vue";
import router from "@/router/index.js";
import {useUserStore} from "@/stores/UserStore.js";

const route = useRoute();

const userStore = useUserStore();
const employeeInfo = userStore.getEmployeeInfo();
const employeeRole = employeeInfo.employeeRole[0];

const wikiTitle = ref('');
const latestModDate = ref('');
const wikiContent = ref('');
const tableOfContents = ref([]);  // 목차 데이터

defineProps({
  wikiSeq: {
    type: [String, Number],
    required: true,
  },
});

const fetchingWiki = async (wikiSeq) => {
  try {
    const response = await fetchWiki(wikiSeq);

    wikiTitle.value = response.data.wikiTitle;
    latestModDate.value = response.data.modDate;
    wikiContent.value = response.data.wikiContent;
  } catch (error) {
    alert("위키를 조회하던 도중 오류가 발생했습니다.");
  }
}

const fetchingWikiByWikiModContentSeq = async(wikiSeq, wikiModContentSeq) => {
  try {
    const response = await fetchWikiByWikiModContentSeq(wikiSeq, wikiModContentSeq);

    wikiTitle.value = response.data.wikiTitle;
    latestModDate.value = response.data.modDate;
    wikiContent.value = response.data.wikiContent;
  } catch (error) {
    alert("위키를 조회하던 도중 오류가 발생했습니다.");
  }
}

// 목차를 생성하는 메서드
const generateTableOfContents = (wikiContent) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = wikiContent;

  // h1 ~ h6 태그를 찾아서 목차 목록 생성
  const headers = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
  tableOfContents.value = Array.from(headers).map((header) => ({
    tag: header.tagName,  // 태그 이름 가져오기
    text: header.textContent,  // 태그 내의 내용 가져오기
    id: header.id || header.textContent.replace(/\s+/g, '-').toLowerCase()
  }));
}

const formattingDateTime = (dateTime) => {
  return dateTime.replace("T", " ");
}

const isModalOpen = ref(false);

const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value;
}

const closeModal = () => {
  isModalOpen.value = false;
};

const navigateToWikiUpdatePage = () => {
  const wikiSeq = route.params.wikiSeq;
  router.push(`/wiki/newpost/${wikiSeq}`)
}

const deletingWiki = async () => {
  if (!confirm("위키를 삭제하시겠습니까?")) return;
  try {
    const wikiSeq = route.params.wikiSeq;
    await deleteWiki(wikiSeq);
    alert("위키가 삭제되었습니다.");
    await goBackToWikiList();
  } catch (error) {
    console.error("위키 삭제에 실패했습니다.");
    throw error;
  }
}

const goBackToWikiList = () => {
  router.push(`/wiki`);
}

watch(() => route.params.wikiSeq, async () => {
  const wikiSeq = route.params.wikiSeq;
  const wikiModContentSeq = route.params.wikiModContentSeq;

  if (wikiModContentSeq === undefined) {
    await fetchingWiki(wikiSeq);
  } else {
    await fetchingWikiByWikiModContentSeq(wikiSeq, wikiModContentSeq);
  }
});

// 콘텐츠가 변경될 때마다 목차를 새로 생성
watch(() => wikiContent.value, (newContent) => {
  generateTableOfContents(newContent);
});

// 라우트 변경 시 데이터 새로고침 (watchEffect 사용)
watchEffect(async () => {
  const wikiSeq = route.params.wikiSeq;
  const wikiModContentSeq = route.params.wikiModContentSeq;

  if (wikiModContentSeq === undefined) {
    await fetchingWiki(wikiSeq);
  } else {
    await fetchingWikiByWikiModContentSeq(wikiSeq, wikiModContentSeq);
  }
});

onMounted(async () => {
  const wikiSeq = route.params.wikiSeq;
  const wikiModContentSeq = route.params.wikiModContentSeq;

  if(wikiModContentSeq === undefined) {
    await fetchingWiki(wikiSeq);
  } else {
    await fetchingWikiByWikiModContentSeq(wikiSeq, wikiModContentSeq);
  }
  generateTableOfContents(wikiContent.value);
})
</script>

<template>
  <div class="wiki-container">
    <div class="wiki-page-title">인턴위키</div>
    <WhiteBoxListComponent class="wiki-detail-white-box-list-component">
      <div class="wiki-header-container">
        <div class="wiki-title"> {{ wikiTitle }}</div>
        <div class="flex">
          <button class="yellow-border-button" @click="toggleModal">히스토리</button>
          <button class="yellow-background-button" @click="navigateToWikiUpdatePage">편집</button>
          <button v-if="employeeRole === 'HR'" class="gray-background-button" @click="deletingWiki">삭제</button>
        </div>
      </div>
      <WikiHistoryModal
          :wikiSeq="wikiSeq"
          v-if="isModalOpen"
          @close="closeModal"
          @click.stop
      />
      <div class="latest-mod-date">최근 수정 시각: {{ formattingDateTime(latestModDate) }}</div>
      <!-- 목차 표시 -->
      <div v-if="tableOfContents.length > 0" class="toc-container">
        <div class="toc-title">목차</div>
        <ul>
          <li v-for="(item, index) in tableOfContents" :key="index">
            <a :href="'#' + item.id">{{ item.text }}</a>
          </li>
        </ul>
      </div>
      <div v-html="wikiContent" class="wiki-content"></div>
    </WhiteBoxListComponent>
    <div class="wiki-button-container">
      <button @click="goBackToWikiList" class="go-back-to-wiki-list-button">뒤로가기</button>
    </div>
  </div>
</template>

<style scoped>
.wiki-container {
  width: 70%;
  min-width: 640px;
  margin: 0 auto;
}

.wiki-page-title {
  font-size: 1.875rem;
  font-weight: bold;
  text-align: center;
  margin: 6.565rem 0 2.88rem 0;
}

.wiki-detail-white-box-list-component {
  position: relative;
}

.wiki-title {
  font-size: 2rem;
  font-weight: bold;
}

.wiki-header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.latest-mod-date {
  font-size: 0.9rem;
  color: var(--gray);
  margin: 0.8rem 0;
}

.yellow-border-button, .yellow-background-button, .gray-background-button {
  border: transparent;
  border-radius: 10px;
  width: 5rem;
  height: 2.2rem;
  font-size: 15px;
  margin: 0 0.1rem;
  cursor: pointer;
}

.yellow-border-button {
  background-color: var(--white);
  color: var(--black);
  border: 1px solid var(--yellow);
}

.yellow-border-button:hover {
  background-color: var(--yellow);
}

.yellow-background-button {
  background-color: var(--yellow);
  color: var(--white);
}

.yellow-background-button:hover {
  background-color: var(--dark-yellow);
}

.gray-background-button {
  background-color: var(--gray);
  color: var(--white);
}

.gray-background-button:hover {
  background-color: var(--black);
}

.toc-container {
  border: 1px solid var(--light-gray);
  margin-top: 1rem;
  padding: 1rem 1.5rem;
  display: inline-block;
}

.toc-title {
  font-size: 20px;
  font-weight: 500;
}

.toc-container > ul {
  list-style: none;
  padding: 0;
}

.toc-container li {
  margin: 0.5rem 0;
}

.toc-container a {
  text-decoration: none;
  color: var(--black);
}

.go-back-to-wiki-list-button {
  width: 6.5rem;
  height: 2.5rem;
  cursor: pointer;
  border-radius: 10px;
  border: none;
  font-size: 16px;
  background-color: var(--gray);
  color: var(--white);
}

.wiki-button-container {
  display: flex;
  justify-content: center;
  margin: 2rem;
}

</style>