import{ createRouter, createWebHistory } from 'vue-router';
import QuizRouter from '@/router/QuizRouter.js';

const routes = [
    ...QuizRouter
]

const router = createRouter({
    history : createWebHistory(),
    routes,

    scrollBehavior (to, from, savedPosition) {
        
        if(savedPosition){
            return savedPosition;
        }else{
            return { top: 0 };
        }
    }
});

export default router;