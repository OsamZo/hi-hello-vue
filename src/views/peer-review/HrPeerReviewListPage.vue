<template>
    <div class="peer-review-list-container">
        <!-- 헤더 -->
        <h1>동료 평가 지표 관리</h1>

        <!-- 리스트 컴포넌트 -->
        <white-box class="peer-review-list__white-box">
            <div class="list-wrapper">
                <!-- 리스트 헤더 -->
                <div class="list-header">
                    <div class="peer-review-list__column">순서</div>
                    <div class="peer-review-list__column">항목</div>
                    <div class="peer-review-list__column">배점</div>
                    <div class="peer-review-list__column"></div>
                </div>

                <!-- 리스트 아이템 -->
                <div v-if="peerReviewList.length > 0">
                    <list-component :items="peerReviewList">
                        <template #item="{ item, index }">
                            <div class="peer-review-list__result-item">
                                <div class="peer-review-list__column-box-1">{{ index + 1 }}</div>
                                <div class="peer-review-list__column-box-2">{{ item.peerReviewListContent }}</div>
                                <div class="peer-review-list__column-box-3">{{ item.peerReviewListScore }}</div>
                                <div class="peer-review-list__column-box-4">
                                    <button class="peer-review-list__delete-btn" @click="handleDelete(item.peerReviewListSeq)">
                                        삭제
                                    </button>
                                </div>
                            </div>
                        </template>
                    </list-component>
                </div>
                <div v-else>
                    <p class="no-data">동료 평가 지표 데이터가 없습니다.</p>
                </div>

                <!-- 새 항목 입력 필드 -->
                <div v-if="isAdding" class="peer-review-list__result-item">
                    <div class="peer-review-list__column-5">{{ peerReviewList.length + 1 }}</div>
                    <div class="peer-review-list__column-6">
                        <input v-model="newItem.name" placeholder="항목명" class="peer-review-list__input-field" />
                    </div>
                    <div class="peer-review-list__column-7">
                        <input v-model.number="newItem.score" placeholder="배점" 
                        type="number" class="peer-review-list__input-field" />
                    </div>
                    <div class="peer-review-list__column-8">
                        <button class="peer-review-list__confirm-btn" @click="handleAdd">확인</button>
                        <button class="peer-review-list__cancel-btn" @click="cancelAddItem">취소</button>
                    </div>
                </div>

                <!-- 추가 버튼 -->
                <div class="peer-review-list__add-button-container">
                    <button class="peer-review-list__add-btn" @click="startAdding">+ 항목추가</button>
                </div>
            </div>
        </white-box>
    </div>
</template>

<script setup>
import "@/styles/peer-review/PeerReviewList.css";
import { ref, onMounted } from 'vue';
import WhiteBox from "@/components/WhiteBoxComponent.vue";
import ListComponent from "@/components/ListComponent.vue";
import { fetchPeerReviewList, postPeerReviewList, deletePeerReviewList } from "@/services/PeerReviewApi";

const peerReviewList = ref([]);
const isAdding = ref(false);
const newItem = ref({ name: "", score: null });


onMounted(async () => {
    await loadPeerReviewList();
});

const loadPeerReviewList = async () => {
    try {
        const response = await fetchPeerReviewList();
        if (response.success && response.data) {
            peerReviewList.value = response.data;
        }
    } catch (error) {
        console.error("동료 평가 지표 조회 실패:", error);
    }
};

const handleAdd = async () => {
    if (!newItem.value.name.trim() || newItem.value.score == null) {
        console.error("항목명과 배점을 입력해주세요.");
        return;
    }

    const requestData = {
        peerReviewListContent: newItem.value.name.trim(),
        peerReviewScore: newItem.value.score,
    };

    try {
        await postPeerReviewList(requestData);
        isAdding.value = false;
        newItem.value = { name: "", score: null };
        alert("평가 지표 등록 성공");
        await loadPeerReviewList();
    } catch (error) {
        console.error("동료 평가 지표 추가 실패:", error?.response?.data || error.message);
    }
};

const handleDelete = async (peerReviewListSeq) => {
    try {
        await deletePeerReviewList(peerReviewListSeq);
        alert("평가 지표 삭제 성공");
        await loadPeerReviewList();
    } catch (error) {
        console.error("동료 평가 지표 삭제 실패:", error);
    }
};

const startAdding = () => {
    isAdding.value = true;
    newItem.value = { name: "", score: "" };
};

const cancelAddItem = () => {
    isAdding.value = false;
    newItem.value = { name: "", score: "" };
};
</script>

<style scope>
/* 크롬, 사파리, 엣지 */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* 파이어폭스 */
input[type="number"] {
    -moz-appearance: textfield;
}

.header{
  height: 0 !important;
}
</style>