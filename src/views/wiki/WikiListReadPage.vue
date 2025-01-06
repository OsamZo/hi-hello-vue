<script setup>
import ListComponent from "@/components/ListComponent.vue";
import {onMounted, reactive, ref, watch} from "vue";
import {fetchWikiList, searchWiki} from "@/services/WikiApi.js";
import SearchBarComponent from "@/components/SearchBarComponent.vue";
import router from "@/router/index.js";
import WhiteBoxComponent from "@/components/WhiteBoxComponent.vue";

const wikiList = reactive([]);
const searchQuery = ref('');
const searchedWikiList = reactive([]);
const suggestedKeyword = ref([]);
const isSearching = ref(false);

const fetchingWikiList = async () => {
  try {
    const response = await fetchWikiList();

    response.data.forEach(wiki => {
      wikiList.push({
        wikiSeq: Number(wiki.wikiSeq),
        wikiTitle: wiki.wikiTitle,
        latestModDate: wiki.latestModDate
      })
    })
  } catch (error) {
    alert("위키 리스트를 조회하던 도중 오류가 발생했습니다.");
  }
}

const searchingWiki = async(keyword) => {
  try {
    if (!keyword) {
      isSearching.value = false; // 검색어가 없으면 전체 리스트 표시
      alert("검색어를 입력해주세요.");
      return;
    }

    const response = await searchWiki(keyword);
    searchedWikiList.length = 0;

    response.data.data.forEach(wiki => {
      searchedWikiList.push({
        wikiSeq: wiki.wikiSeq,
        wikiTitle: wiki.wikiTitle,
        latestModDate: wiki.latestModDate
      })
    })

    suggestedKeyword.value = [];
    isSearching.value = true;
  } catch(error) {
    alert("위키를 검색하던 도중 오류가 발생했습니다.");
  }
}

const suggestingKeyword = async(keyword) => {
  try {
    const response = await searchWiki(keyword.value);
    suggestedKeyword.value = response.data.data;

  } catch(error) {
    console.error('검색어 자동완성 중 오류가 발생했습니다.', error);
  }
}

const navigateToWikiNewPost = () => {
  router.push('/wiki/newPost');
}

const navigateToWiki = (wikiSeq) => {
  router.push(`/wiki/${wikiSeq}`);
}

const formattingDateTime = (dateTime) => {
  const date = new Date(dateTime);
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

watch(searchQuery, (newQuery) => {
  if (!newQuery) {
    suggestedKeyword.value = []; // 검색어가 없으면 자동완성 리스트 초기화
  } else {
    suggestingKeyword(searchQuery);
  }
});

onMounted(async () => {
  await fetchingWikiList();
})
</script>

<template>
  <div class="content_box">
    <div class="title">인턴위키</div>
    <div class="search-bar-header-container">
      <div class="search-bar-container">
        <SearchBarComponent
            v-model:searchQuery="searchQuery"
            @search="searchingWiki"
            class="search-bar-component"
            :class="{ 'flat-bottom': suggestedKeyword.length > 0 }"/>
        <div v-if="suggestedKeyword.length > 0" class="suggested-keyword-container">
          <div
              v-for="item in suggestedKeyword"
              :key="item.wikiSeq"
              class="wiki-title-container"
              @click="navigateToWiki(item.wikiSeq)"
          >
            <div>{{ item.wikiTitle }}</div>
          </div>
        </div>
      </div>
      <button class="purple-button" @click="navigateToWikiNewPost">문서작성</button>
    </div>
    <WhiteBoxComponent>
      <ListComponent :items="isSearching ? searchedWikiList : wikiList">
        <template #header>
          <div class="left_list">문서</div>
          <div class="right_list">수정시간</div>
        </template>

        <template #item="{ item }">
          <div class="wiki_list_row_container" @click="navigateToWiki(item.wikiSeq)">
            <div class="left_list">{{ item.wikiTitle }}</div>
            <div class="right_list">{{ formattingDateTime(item.latestModDate) }}</div>
          </div>
        </template>
      </ListComponent>
    </WhiteBoxComponent>
  </div>
</template>

<style scoped>
.content_box {
  width: 70%;
  margin: 0 auto;
  min-width: 700px;
}

.title {
  font-size: 30px;
  font-weight: bold;
  text-align: center;
  margin: 105px 0 49px;
}

.search-bar-header-container {
  display: flex;
  width: 80%;
  align-items: center;
  margin: 0 auto;
}

.search-bar-container {
  display: flex;
  flex-direction: column;
  width: 80%;
  margin: 0 auto;
  position: relative;
}

.search-bar-component.flat-bottom {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  box-shadow: none;
}

.suggested-keyword-container {
  width: 80%;
  margin-left: 10%;
  padding: 3px 0;
  top: 50px;
  background-color: var(--white);
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
  position: absolute;
  box-shadow: 1px 1px var(--light-gray);
}

.wiki-title-container {
  padding: 12px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.wiki-title-container:hover {
  background-color: var(--light-purple);
  cursor: pointer;
}

.purple-button {
  background-color: var(--purple);
  width: 111px;
  height: 43px;
  color: var(--white);
  border-radius: 10px;
  border: none;
  margin-right: 10%;
  cursor: pointer;
}

.purple-button:hover {
  background-color: var(--dark-purple);
}

.wiki_list_row_container {
  display: flex;
  font-size: 15px;
  margin: 10px 20px;
  justify-content: space-between;
  cursor: pointer;
}

.left_list {
  text-align: left;
  white-space: nowrap;
}

.right_list {
  display: flex;
  text-align: right;
}

.right_list > div:first-child {
  width: 200px;
  text-align: center;
}

.right_list > div:last-child {
  width: 180px;
  text-align: center;
}
</style>