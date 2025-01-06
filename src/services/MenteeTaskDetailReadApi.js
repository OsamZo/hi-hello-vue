import axios from 'axios';
import { springAPI } from "@/services/axios.js";
import {nextTick} from "vue";
import { useRoute } from 'vue-router';

// 날짜 포맷팅 함수 (YYYY-MM-DD HH:mm:ss 형식)
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}까지`;
};

// API 호출 함수 (과제 세부 사항 가져오기)
export const fetchTaskDetail = async (taskSeq, taskDetail, getAuthHeader) => {
    try {
        const response = await springAPI.get(`/mentee/task/${taskSeq}`, {
            headers: getAuthHeader(),
        });

        console.log(response); // 응답 구조를 확인하기 위해 추가

        if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
            const { taskTitle, taskContent, templateEndAt, fileName, fileUrl } = response.data.data[0];
            taskDetail.value = {
                taskTitle,
                taskContent,
                templateEndAt,
                fileName,
                fileUrl,
            };
        } else {
            console.error("응답 데이터가 없거나 형식이 잘못되었습니다.");
        }
    } catch (error) {
        console.error('API 호출 실패:', error);
    }
};


// 파일 첨부 버튼 클릭 시 input[type=file]을 클릭하도록 처리
export const triggerFileInput = (fileInput) => {
    // Vue의 nextTick을 사용하여 DOM이 렌더링된 후에 참조되는지 확인
    nextTick(() => {
        if (fileInput && fileInput.value) {
            fileInput.value.click(); // input[type=file] 클릭 이벤트 발생
        } else {
            console.error('fileInput 요소가 존재하지 않습니다.');
        }
    });
};

// 파일 첨부 시 uploadedFileName에 파일 이름을 저장
export const handleFileChange = (event, file, uploadedFileName) => {
    const selectedFile = event.target.files[0];  // event.target을 제대로 확인
    if (selectedFile) {
        file.value = selectedFile;  // 파일을 ref에 저장
        uploadedFileName.value = selectedFile.name; // 업로드된 파일 이름을 ref에 저장
    }
};

// 과제 제출 함수
export const submitTask = async (taskSeq, taskSubmitContent, file, uploadedFileName, getAuthHeader) => {
    try {
        const formData = new FormData();

        // 서버가 요구하는 키 이름으로 JSON 데이터를 추가
        const createSubmitDTO = {
            taskSubmitContent: taskSubmitContent.value,
            fileName: uploadedFileName.value,
        };
        formData.append("createSubmitDTO", new Blob([JSON.stringify(createSubmitDTO)], { type: "application/json" }));

        // 파일이 선택된 경우 FormData에 추가
        if (file.value) {
            formData.append("fileUrl", file.value); // 서버가 요구하는 파트 이름과 일치
        }

        // API 요청
        const response = await springAPI.post(`/mentee/task/${taskSeq}`, formData, {
            headers: {
                ...getAuthHeader(),
                "Content-Type": "multipart/form-data", // Axios가 자동으로 설정
            },
        });

        // 응답 처리
        if (response.data.success) {
            alert("과제가 성공적으로 제출되었습니다!");
        } else {
            alert("과제 제출 실패: " + response.data.message);
        }
    } catch (error) {
        console.error("과제 제출 중 오류 발생:", error);
        alert("과제 제출 중 오류가 발생했습니다.");
    }
};

export const formatContent = (content) => {
    if (!content) return '';
    return content.replace(/\n/g, '<br>'); // '\n'을 <br>로 변환
};
