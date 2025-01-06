import axios from 'axios';
import {springAPI} from "@/services/axios.js";

export default {
    async updateChecklistStatus(checklistStatusSeq, checklistSeq, listCheckedStatus) {
        try {
            const payload = {
                checklistStatusSeq,
                checklistSeq,
                listCheckedStatus,
            };

            const response = await springAPI.put('/onboarding/checklist', payload, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.data.success) {
                console.log('체크리스트 상태 업데이트 성공:', response.data.message);
            } else {
                console.error('체크리스트 상태 업데이트 실패:', response.data.message);
            }
        } catch (error) {
            console.error('API 호출 에러:', error);
        }
    },

    async fetchOnboardingData() {
        try {
            const response = await springAPI.get('mentee/onboarding', {
                params: { taskContent: this.query },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.data.success) {
                this.onboardingList = this.groupChecklistByTemplate(response.data.data.onboardingList);

                // 완료된 항목과 전체 항목의 개수 계산
                this.completedCount = this.onboardingList.filter(item => item.onboardingCompletedStatus).length;
                this.totalCount = this.onboardingList.length;
            } else {
                console.error('데이터 호출 실패:', response.data.message);
            }
        } catch (error) {
            console.error('API 호출 에러:', error);
        } finally {
            this.loading = false;
        }
    },

    groupChecklistByTemplate(onboardingList) {
        const groupedItems = [];

        onboardingList.forEach(item => {
            let template = groupedItems.find(group => group.templateSub === item.templateSub);

            if (!template) {
                template = {
                    templateTitle : item.templateTitle,
                    templateSub: item.templateSub,
                    templateDetail: item.templateDetail,
                    templateType: item.templateType,
                    checklistContent: [],
                    onboardingCompletedStatus: item.onboardingCompletedStatus,
                    templateUrlName: item.templateUrlName,
                    taskSeq: item.taskSeq,
                    taskGroupSeq: item.taskGroupSeq,
                    quizCategoryName: item.quizCategoryName,
                    quizCategorySeq: item.quizCategorySeq,
                };
                groupedItems.push(template);
            }

            if (item.checklistContent) {
                template.checklistContent.push({
                    checklistStatusSeq: item.checklistStatusSeq,
                    checklistSeq: item.checklistSeq,
                    checklistContent: item.checklistContent,
                    listCheckedStatus: item.listCheckedStatus
                });
            }
        });

        return groupedItems;
    },

    goToUrl(url) {
        console.log('Received URL:', url); // URL 값 확인
        if (url) {
            window.open(url, '_blank'); // URL이 정상일 경우 새 탭에서 열기
        } else {
            console.error('URL is null or undefined.');
        }
    },

    // 체크리스트 항목의 상태 변경 (체크박스 개별적으로 처리).
    toggleChecklistStatus(item, content) {
        const updatedStatus = !content.listCheckedStatus;  // 상태 반전
        this.updateChecklistStatus(content.checklistStatusSeq, content.checklistSeq, updatedStatus);
        content.listCheckedStatus = updatedStatus;  // 상태 변경
    },
};


// 온보딩 템플릿 완료 상태 변경
export const changeCompleteStatusByMentee = async(templateSeq) => {
    try {
        await springAPI.put(`mentee/onboarding/template/${templateSeq}/status`);
        alert("온보딩 수행 상태가 변경되었습니다.")
    } catch(error) {
        alert("온보딩 수행 상태 변경 도중 오류가 발생했습니다.");
    }
}

export const changeCompleteStatusByMentor = async(templateSeq) => {
    try {
        await springAPI.put(`mentor/onboarding/template/${templateSeq}/status`);
        alert("온보딩 수행 상태가 변경되었습니다.")
    } catch(error) {
        alert("온보딩 수행 상태 변경 도중 오류가 발생했습니다.");
    }
}

// 체크리스트 수행 완료 상태 조회
export const fetchChecklistStatus = async(templateSeq, userRole) => {
    try {
        return await springAPI.get(`/template/${templateSeq}/checklist/status`, {
            params: {
                userRole: userRole
            }
        });
    } catch(error) {
        alert("체크리스트 수행 완료 상태 조회 중 오류가 발생했습니다.");
    }
}