import {springAPI} from "@/services/axios.js";

export const getChatMessages = async (roomId) => {
    try{
        const response = await springAPI.get(`/chat/${roomId}/messages`);
        return response.data;
    } catch (error){
        console.error("대화 내용 조회 실패",error);
        throw error;
    }
};

export const getMentoringChatRoomSeq = async (employeeSeq) => {
    try {
        const response = await springAPI.get(`/chat/room/mentoring`, {
            params: { userSeq: employeeSeq }, // 쿼리 파라미터로 전달
        });
        return response.data.data;
    } catch (error) {
        console.error("멘토링 체팅방 조회 실패", error);
        throw error;
    }
}

export const getGroupChatRoomSeq = async (employeeSeq) => {
    try {
        const response = await springAPI.get(`/chat/room/grouping`, {
            params: { userSeq: employeeSeq }, // 쿼리 파라미터로 전달
        });
        return response.data.data;
    } catch (error) {
        console.error("그룹핑 체팅방 조회 실패", error);
        throw error;
    }
}