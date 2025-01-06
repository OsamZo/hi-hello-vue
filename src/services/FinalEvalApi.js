import {springAPI} from "@/services/axios.js";

// 최종 평가 결과 생성
export const createFinalEval = async() => {
    try {
        return await springAPI.post(`/final-eval`);
    } catch(error) {
        console.error("최종 평가 결과를 생성하던 도중 오류가 발생했습니다.", error);
        throw error;
    }
}

// 최종 평가 결과 리스트 조회
export const fetchFinalEvalResultList = async() => {
    try {
        return await springAPI.get(`/final-eval`);
    } catch(error) {
        console.error("최종 평가 결과 리스트를 조회하던 도중 오류가 발생했습니다.", error);
    }
}

// 최종 평가 결과 리스트 검색
export const searchFinalEvalResultList = async(keyword) => {
    try {
        return await springAPI.get(`/final-eval/search`, {
            params: {keyword}
        });
    } catch(error) {
        console.error("최종 평가 결과 리스트를 검색하던 도중 오류가 발생했습니다.", error);
    }
}

// 최종 평가 결과 상세 조회
export const fetchFinalEvalResultDetail = async(employeeSeq) => {
    try {
        return await springAPI.get(`/employee/${employeeSeq}/final-eval`);
    } catch(error) {
        console.error("최종 평가 결과 상세 내용을 조회하던 도중 오류가 발생했습니다.", error);
    }
}