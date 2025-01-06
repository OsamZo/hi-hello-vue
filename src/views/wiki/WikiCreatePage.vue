<template>
  <div class="wiki-create-page-container">
    <div class="wiki-create-page-title">인턴위키 등록</div>
    <div>
      <input
          v-model="wikiTitle"
          type="text"
          placeholder="제목을 입력하세요"
          class="wiki-title-input"
      >
    </div>
    <Editor v-model="wikiContent"/>
    <div class="wiki-buttons-container">
      <button @click="goBackToWikiList" class="go-back-to-wiki-list-button">뒤로가기</button>
      <button @click="creatingWiki" class="wiki-create-button">등록하기</button>
    </div>
  </div>
</template>

<script setup>
// 서버로 이미지 파일을 업로드
import Editor from '@/components/EditorComponent.vue';
import {createWiki, indexWiki} from "@/services/WikiApi.js";
import {ref} from "vue";
import router from "@/router/index.js";

const wikiTitle = ref('');
const wikiContent = ref('');

// 위키 생성
const creatingWiki = async () => {
  const wikiData = {
    wikiTitle: wikiTitle.value,
    wikiSnapshotContent: wikiContent.value
  }

  await createWiki(wikiData)
      .then(() => {
        alert("위키가 성공적으로 등록되었습니다.");
        wikiTitle.value = '';
        wikiContent.value = '';
      })
      .catch((error) => {
        console.error("위키 생성 도중 오류가 발생했습니다.", error);
        alert("위키 생성 도중 오류가 발생했습니다.");
      })

  await indexWiki();

  await router.push(`/wiki`);
}

const goBackToWikiList = () => {
  router.push(`/wiki`);
}
</script>

<style scoped>
.wiki-create-page-container {
  width: 70%;
}

.wiki-create-page-title {
  font-size: 30px;
  font-weight: bold;
  text-align: center;
  margin: 6.562rem 0 2.88rem 0;
}

.wiki-title-input {
  width: 100%;
  padding: 1.2rem 1rem;
  font-size: 28px;
  font-weight: bold;
  border: none;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);;
}

.wiki-buttons-container {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
  gap: 2vw;
}

.wiki-create-button, .go-back-to-wiki-list-button {
  width: 6.5rem;
  height: 2.5rem;
  cursor: pointer;
  border-radius: 10px;
  border: none;
  font-size: 16px;
}

.go-back-to-wiki-list-button {
  background-color: var(--gray);
  color: var(--white);
}

.wiki-create-button {
  background-color: var(--purple);
  color: var(--white);
}
</style>