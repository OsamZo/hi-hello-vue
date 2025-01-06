import {springAPI} from "@/services/axios.js";

// 위키 등록
export const createWiki = async(wikiData) => {
    try {
        return await springAPI.post(`/wiki`, wikiData);
    } catch(error) {
        console.error("위키를 등록하던 중 오류가 발생했습니다.", error);
    }
}

// 위키 인덱스 생성
export const indexWiki = async() => {
    try {
        const response = await springAPI.post(`/wiki/index`);
        return response.data;
    } catch(error) {
        console.error('위키 인덱스 생성 중 오류가 발생했습니다.', error);
    }
}

// 위키 리스트 조회
export const fetchWikiList = async() => {
    try {
        const response = await springAPI.get(`/wiki`);
        return response.data;
    } catch(error) {
        console.error('위키 리스트를 가져오는 중 오류가 발생헸습니다.', error);
    }
}

// 위키 내용 조회
export const fetchWiki = async(wikiSeq) => {
    try {
        const response = await springAPI.get(`/wiki/${wikiSeq}`);
        return response.data;
    } catch(error) {
        console.error('위키 내용을 가져오는 중 오류가 발생헸습니다.', error);
    }
}

// 위키 히스토리 리스트 조회
export const fetchWikiHistory = async(wikiSeq) => {
    try {
        const response = await springAPI.get(`/wiki/${wikiSeq}/history`);
        return response.data;
    } catch(error) {
        console.error('위키 히스토리 리스트를 가져오는 중 오류가 발생했습니다.', error);
    }
}

// 위키 특정 버전 내용 조회
export const fetchWikiByWikiModContentSeq = async(wikiSeq, wikiModContentSeq) => {
    try {
        const response = await springAPI.get(`/wiki/${wikiSeq}/ver/${wikiModContentSeq}`);
        return response.data;
    } catch(error) {
        // console.log("위키 특정 버전 내용을 가져오는 중 오류가 발생했습니다.");
    }
}

// 위키 수정
export const updateWiki = async(wikiSeq, wikiData) => {
    try {
        return await springAPI.put(`/wiki/${wikiSeq}`, wikiData);
    } catch(error) {
        // console.error("위키를 수정하던 중 오류가 발생했습니다.", error);
    }
}

// 위키 삭제
export const deleteWiki = async(wikiSeq) => {
    try {
        return await springAPI.delete(`/wiki/${wikiSeq}`);
    } catch(error) {
        console.error("위키를 삭제하던 중 오류가 발생했습니다.", error);
    }
}

// 위키 검색
export const searchWiki = async(keyword) => {
    try {
        return await springAPI.get(`/wiki/search`, {
            params: {keyword}
        });
    } catch(error) {
        console.error("위키를 검색하던 중 오류가 발생했습니다.", error);
    }
}