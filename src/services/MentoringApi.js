import {springAPI} from "@/services/axios.js";

// 멘토링 계획서 전체 리스트 조회
export const fetchMentoringPlanningList = async() => {
    try{
        const response = await springAPI.get('/mentor/planning');
        return response.data;
    } catch (error){
        console.error("멘토링 계획서 리스트를 불러오지 못했습니다.",error);
    }
}

// 멘토링 계획서 검색
export const searchMentoringPlans = (category, word) => {
    return springAPI.get(`/mentor/planning/search`, {
        params: { category, word }
    });
};

// 멘토링 계획서 등록
export const submitMentoringPlanService = (formData) => {
    return springAPI.post("/mentor/planning", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }).then((response) => response.data);
};

// 멘토링 계획서 상세 조회
export const fetchMentoringPlanDetail = async (planningSeq) => {
    try {
        const response = await springAPI.get(`/mentor/planning/${planningSeq}`);
        return response.data; // 성공 시 데이터 반환
    } catch (error) {
        console.error("멘토링 계획서 상세 조회 실패:", error);
        throw error;
    }
};

// 멘토링 계획서 상태 처리 (팀장)
export const updateMentoringPlanStatus = (planningSeq, planningStatus) => {
    return springAPI.put(`/leader/planning/${planningSeq}`, { planningStatus });
};

// 멘토링 그룹 생성
export const createMentoringGroup = (mentoringGroupDTO) => {
    return springAPI.post(`/hr/matching`, mentoringGroupDTO);
};

// 부서 조회
export const fetchDepartmentList = () => {
    return springAPI.get("/hr/department");
};

// 부서별 멘토 조회
export const fetchMentorsByDepartment = (departmentSeq) => {
    return springAPI.get(`/hr/mentor/${departmentSeq}`)
}

// 부서별 멘티 조회
export const fetchMenteeByDepartment = (departmentSeq) => {
    return springAPI.get(`/hr/mentee/${departmentSeq}`)
}

// (담당자) 멘토링 보고서 검색
export const searchReports = (searchType, keyword) => {
    return springAPI.get(`/hr/report/search`, {
        params: {
            searchType: searchType.value,
            keyword: keyword
        }
    });
}

// (팀장) 멘토링 보고서 검색
export const searchReportsByLeader = (searchType, keyword) => {
    return springAPI.get(`/leader/report/search`, {
        params: {
            searchType: searchType.value,
            keyword: keyword
        }
    });
}

// (멘토) 멘토링 보고서 목록 조회
export const fetchReportListByMentor = () => {
    return springAPI.get(`/mentor/report`);
};

// (멘티) 멘토링 보고서 목록 조회
export const fetchReportListByMentee = () => {
    return springAPI.get(`/mentee/report`);
}

// (담당자) 멘토링 보고서 목록 조회
export const fetchReportListByHR = () => {
    return springAPI.get(`/hr/report`);
}

// (팀장) 멘토링 보고서 목록 조회
export const fetchReportListByLeader = () => {
    return springAPI.get(`/leader/report`);
}

// (멘티) 멘토링 주차 조회
export const getMentoringWeek = () => {
    return springAPI.get(`/mentee/mentoring/week`);
}

// (멘티) 멘토링 보고서 작성
export const CreateReport = (employeeSeq, reportData) => {
    return springAPI.post(`/mentee/${employeeSeq}/report`, reportData);
}

// 보고서 상세조회
export const getReportDetail = (reportSeq) => {
    return springAPI.get(`/report/detail`, {
        params: {
            reportSeq: reportSeq
        }
    });
}

// (멘티) 보고서 수정
export const updateReport = (employeeSeq, reportSeq, updateData) => {
    const response = springAPI.put(`/mentee/${employeeSeq}/report/${reportSeq}`, updateData);
    return response;
}

// (멘토) 피드백 작성/수정
export const updateFeedback = (employeeSeq, reportSeq, reportFeedbackContent) => {
    return springAPI.put(`/mentor/${employeeSeq}/report/${reportSeq}`, {
        reportFeedbackContent: reportFeedbackContent
    });
}