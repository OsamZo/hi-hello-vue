import {defineStore} from "pinia";
import {ref} from "vue";
import {getAlarmCount} from "@/services/AlramApi.js";

export const useNotificationStore = defineStore('notification',  () => {
    const notiCount = ref(0);

    const updateNotiCount = async () => {
        try {
            const response = await getAlarmCount();
            notiCount.value = response.data.data.alarmCount;
        } catch (error) {
            console.error("Error loading notiCount:", error);
            notiCount.value = 0;
        }
    }

    return {
        notiCount,
        updateNotiCount
    };
});