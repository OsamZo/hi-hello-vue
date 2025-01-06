import {springAPI} from "@/services/axios.js";

// 알림 목록 조회
export const getAlarmList = () => {
    return springAPI.get(`/notify/list`);
}

// 알림 단일 읽음
export const readNoti = (notiSeq) => {
    return springAPI.put(`/notify/${notiSeq}`);
}

// 알림 단일 삭제
export const deleteNoti = (notiSeq) => {
    return springAPI.delete(`notify/${notiSeq}`);
}

// 읽지않은 알림 개수 조회
export const getAlarmCount = () => {
    return springAPI.get(`/notify/list/count`)}
