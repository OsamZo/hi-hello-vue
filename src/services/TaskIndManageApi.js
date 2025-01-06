// TaskIndManageApi.js
import { ref, onMounted } from 'vue';
import axios from 'axios';
import {springAPI} from "@/services/axios.js";

export function useEvalItems() {
    const evalItems = ref([]);
    const newItem = ref({
        evalIndContent: '',
        evalIndScore: 0,
    });

    const loadEvalItems = async () => {
        try {
            const response = await springAPI.get('hr/eval/ind', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.data.success) {
                evalItems.value = response.data.data;
            } else {
                console.error('데이터 조회 실패:', response.data.message);
            }
        } catch (error) {
            console.error('API 요청 실패:', error);
        }
    };

    onMounted(() => {
        loadEvalItems();
    });

    const addItem = async () => {
        // console.log('전송 전 데이터:', newItem.value); // 디버깅용

        if (!newItem.value.evalIndContent.trim()) {
            alert('항목을 입력해주세요.');
            return;
        }
        if (!newItem.value.evalIndScore || newItem.value.evalIndScore <= 0) {
            alert('올바른 배점을 입력해주세요.');
            return;
        }

        try {
            const response = await springAPI.post(
                'hr/eval/ind',
                { evalIndContent: newItem.value.evalIndContent, evalIndScore: newItem.value.evalIndScore },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            if (response.data.success) {
                // console.log('API 요청 데이터:', newItem.value);
                alert('평가 지표를 성공적으로 추가하였습니다.');
                newItem.value.evalIndContent = '';
                newItem.value.evalIndScore = 0;

                // 항목을 추가한 후 데이터를 새로 로드하여 목록을 갱신
                loadEvalItems();
            } else {
                console.error('데이터 추가 실패:', response.data.message);
            }
        } catch (error) {
            console.error('API 요청 실패:', error);
        }
    };

    const deleteItem = async (evalIndSeq) => {
        if (!evalIndSeq) {
            alert('유효하지 않은 항목입니다.');
            return;
        }

        try {
            const response = await springAPI.delete(
                `hr/eval/ind/${evalIndSeq}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            if (response.data.success) {
                // 삭제 성공 시, 해당 항목을 배열에서 제거
                evalItems.value = evalItems.value.filter(item => item.evalIndSeq !== evalIndSeq);
                // console.log('삭제 성공');
                alert('평가 지표가 성공적으로 삭제되었습니다.');
            } else {
                console.error('삭제 실패:', response.data.message);
            }
        } catch (error) {
            console.error('API 요청 실패:', error);
        }
    };

    return {
        evalItems,
        newItem,
        addItem,
        deleteItem,
    };
}
