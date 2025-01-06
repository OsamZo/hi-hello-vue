<template>
    <div class="mentee-container">
        <header class="mentee-header">
            <div class="mentor_profile_page_title">멘티 조회</div>
        </header>

        <div class="mentee-card" v-if="mentee">
            <div class="mentee-card-header">
                <div class="mentee-image-container">
                    <img class="mentee-image"
                        :src="mentee.fileUrl || 'https://hi-hello-bucket.s3.ap-northeast-2.amazonaws.com/982d01fa-4aac-4cba-b477-993841d53842_%EB%A3%A8%ED%94%BC.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20241216T071922Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIAQXPZDBYQREV7D6US%2F20241216%2Fap-northeast-2%2Fs3%2Faws4_request&X-Amz-Signature=eed2f8afca007ee9a5e3d5f04f92029d984940566bc8716e1c108a3d0a13526b'"
                        alt="멘토 이미지" />
                </div>

                <div class="mentee-header-details">
                    <h2 class="mentee-name">{{ mentee.employeeName }}</h2>
                    <p class="mentee-phone">{{ mentee.employeePhone }}</p>
                    <a :href="`mailto:${mentee.employeeEmail}`" class="mentee-email">{{ mentee.employeeEmail }}</a>
                </div>
            </div>

            <div class="mentee-info">
                <div class="info-row">
                    <span class="info-label">소속</span>
                    <span class="info-value">{{ mentee.departmentName }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">역할</span>
                    <span class="info-value">{{ roleLabel }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">직급</span>
                    <span class="info-value">{{ mentee.positionName }}</span>
                </div>
            </div>
        </div>

        <div v-else>
            <p>멘토 정보를 불러오는 중...</p>
        </div>
    </div>
</template>

<script setup>
import "@/styles/user/MenteeInfoPage.css";
import { ref, computed, onMounted } from "vue";
import { fetchMenteeInfo } from "@/services/UserApi.js";

const mentee = ref(null);

// 역할 표시 로직
const roleLabel = computed(() => {
    if (!mentee.value) return "N/A";
    return mentee.value.employeeRole === "mentee" ? "멘토" : mentee.value.employeeRole || "N/A";
});

const loadMenteeInfo = async () => {
    try {
        const response = await fetchMenteeInfo();
        if (response.success) {
            mentee.value = response.data;
        } else {
            console.error("멘토 정보 불러오기 실패:", response.message);
        }
    } catch (error) {
        console.error("API 호출 중 오류:", error);
    }
};

onMounted(() => {
    loadMenteeInfo();
});
</script>
