import {springAPI} from "@/services/axios.js";

export const fetchMenteesByDepartment = (departmentSeq) => {
    return springAPI.get(`/hr/task/mentee/${departmentSeq}`);
};

export const fetchAllMentees = () => {
    return springAPI.get('/hr/mentee');
};

// 제출된 그룹 과제의 그룹 멤버 조회
export const fetchTaskGroupMembers = async(taskSubmitSeq) => {
    try {
        return await springAPI.get(`/hr/task-submit/${taskSubmitSeq}/members`);
    } catch(error) {
        console.error("제출된 그룹 과제의 그룹 멤버를 조회하던 도중 오류가 발생했습니다.", error);
    }
}