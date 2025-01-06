import { ref } from 'vue';
import { springAPI } from "@/services/axios.js";

// 템플릿 리스트
export const templateList = ref([]); // 저장된 템플릿 리스트

// 가장 큰 templateProcedure 값을 관리할 ref
export const maxTemplateProcedure = ref(0); // 가장 큰 templateProcedure 값 초기화

// 템플릿 리스트에서 가장 큰 templateProcedure 값을 갱신
export const setMaxTemplateProcedure = () => {
    if (templateList.value.length === 0) return; // 템플릿이 없으면 처리 안함

    maxTemplateProcedure.value = templateList.value.reduce((max, current) => {
        return current.templateProcedure > max ? current.templateProcedure : max;
    }, 0);  // 기본값 0 설정
    // console.log("Updated maxTemplateProcedure:", maxTemplateProcedure.value); // 디버깅 로그
};

// 템플릿 리스트 불러오기 함수
export const loadTemplates = async () => {
    try {
        const response = await springAPI.get('/hr/onboarding'); // 템플릿 리스트 가져오는 API
        templateList.value = response.data.data; // 템플릿 리스트 갱신

        // 템플릿 리스트가 갱신된 후, 가장 큰 templateProcedure 값을 갱신
        setMaxTemplateProcedure();
        // console.log("가장 큰 templateProcedure 값:", maxTemplateProcedure.value);

    } catch (error) {
        // console.error('템플릿 목록 로드 중 오류:', error);
    }
};

// 템플릿 데이터를 리셋하는 함수
export const resetTemplateData = () => {
    setMaxTemplateProcedure(); // 항상 최신화된 값 보장
    // console.log("Reset template with maxTemplateProcedure:", maxTemplateProcedure.value); // 디버깅 로그

    // 템플릿 폼 초기화
    templateForm.value = {
        templateType: templateForm.value.templateType, // 현재 선택된 templateType만 남겨둠
        templateTrainingType: '',
        templateTitle: '',
        templateSub: '',
        templateDetail: '',
        checklistContent: [],
        templateQuizQty: '',
        templateTaskRound: '',
        templateProcedure: maxTemplateProcedure.value + 1,  // 가장 큰 값 + 1
        templateEndAt: '',
    };
};

// 템플릿 순서를 업데이트하는 함수
export const updateTemplateProcedure = async (updatedTemplates) => {
    try {
        const updateDTO = updatedTemplates.map((template, index) => ({
            templateSeq: template.templateSeq,
            templateProcedure: index + 1, // 순서를 1부터 시작하여 할당
        }));

        // 서버로 모든 템플릿의 순서를 업데이트 요청
        await springAPI.put(`/hr/onboarding/updateTemplateProcedure`, { templates: updateDTO });

        alert("템플릿 순서가 업데이트되었습니다.");
        await loadTemplates();  // 템플릿 리스트 새로 고침
    } catch (error) {
        // console.error("템플릿 순서 업데이트 실패:", error);
        alert("템플릿 순서 업데이트에 실패했습니다.");
    }
};

// 템플릿 삭제 함수
export const deleteTemplate = async (templateSeq, templateProcedure) => {
    try {
        await springAPI.delete(`/hr/onboarding/${templateSeq}`);

        templateList.value = templateList.value.filter(template => template.templateSeq !== templateSeq);

        const updatedTemplates = templateList.value.map(template => {
            if (template.templateProcedure > templateProcedure) {
                template.templateProcedure -= 1;
            }
            return template;
        });

        await updateTemplateProcedure(updatedTemplates);

        templateList.value = updatedTemplates;

        alert("온보딩 스토리보드가 삭제되었습니다.");
    } catch (error) {
        alert("삭제에 실패했습니다.");
        // console.error("삭제 실패:", error);
    }
};

// 템플릿 유효성 검사
export const isFormValid = ref(true);
export const errorMessage = ref('');

// 템플릿 데이터를 전송하는 함수
export const submitTemplate = async () => {
    await setMaxTemplateProcedure(); // 비동기로 최대값 갱신
    if (!templateForm.value.templateTitle) {
        isFormValid.value = false;
        errorMessage.value = '차수를 입력해 주세요.';
        return; // 차수가 비어 있으면 폼 제출하지 않음
    }

    isFormValid.value = true;
    errorMessage.value = '';

    // console.log("Submit template maxTemplateProcedure:", maxTemplateProcedure.value); // 디버깅 로그

    const formData = new FormData();
    formData.append("createDTO", JSON.stringify({
        quizCategorySeq: templateForm.value.quizCategorySeq,
        templateType: templateForm.value.templateType,
        templateCheckRequiredStatus: templateForm.value.templateCheckRequiredStatus,
        templateTrainingType: templateForm.value.templateTrainingType,
        templateTitle: templateForm.value.templateTitle,
        templateSub: templateForm.value.templateSub,
        templateDetail: templateForm.value.templateDetail,
        templateUrlName: templateForm.value.templateUrlName,
        templateQuizQty: templateForm.value.templateQuizQty,
        templateTaskRound: templateForm.value.templateTaskRound,
        templateProcedure: maxTemplateProcedure.value+1,
        templateEndAt: formatDate(templateForm.value.templateEndAt),
        checklistContent: templateForm.value.checklistContent,
    }));

    if (templateForm.value.file) {
        formData.append("productImgUrl", templateForm.value.file);
    }

    try {
        const response = await springAPI.post('/hr/onboarding', formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        resetTemplateData();
        await loadTemplates(); // 템플릿 리스트 새로고침
    } catch (error) {
        // console.error('템플릿 저장 중 오류:', error);
        alert('템플릿 저장에 실패했습니다.');
    }
};

// 파일 이름 처리
export const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        templateForm.value.file = file;
        templateForm.value.templateUrlName = file.name;
    }
};

// 템플릿 폼 데이터를 위한 ref
export const templateForm = ref({
    quizCategorySeq: null,
    templateType: 'NORMAL',
    templateCheckRequiredStatus: false,
    templateTrainingType: '',
    templateTitle: '',
    templateSub: '',
    templateDetail: '',
    templateUrlName: '',
    templateQuizQty: '',
    templateTaskRound: '',
    templateProcedure: '',
    templateEndAt: '',
    checklistContent: [],
});

export const newChecklistItem = ref("");

export const addChecklistItem = () => {
    if (newChecklistItem.value.trim() !== "") {
        templateForm.value.checklistContent.push({
            checklistContent: newChecklistItem.value.trim(),
        });
        newChecklistItem.value = "";
    } else {
        alert("항목 이름을 입력하세요.");
    }
};

export const removeChecklistItem = (index) => {
    templateForm.value.checklistContent.splice(index, 1);
};

export const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const dragStart = (event, index) => {
    event.dataTransfer.setData('draggedItem', index);
};

export const dragOver = (event) => {
    event.preventDefault();
};

export const drop = (event, index) => {
    const draggedIndex = event.dataTransfer.getData('draggedItem');
    const draggedItem = templateList.value[draggedIndex];
    templateList.value.splice(draggedIndex, 1);
    templateList.value.splice(index, 0, draggedItem);

    updateTemplateProcedure(templateList.value);

    event.preventDefault();
};

export const fetchQuizCategory = async () => {
    try {
        const response = await springAPI.get(`/hr/quizCategory`)
        return response.data;
    } catch (error) {
        // console.error("퀴즈 카테고리 조회 실패", error.response?.data || error.message);
        throw error;
    }
};
