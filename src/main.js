import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';
import './styles/reset.css';
import 'normalize.css';
import '@fortawesome/fontawesome-free/css/all.css';

document.title = import.meta.env.VITE_APP_TITLE || 'Default Title';

// console 로그 필터링 설정 (베포 환경에선 주석 풀기)
// const originalConsole = {...console}
// window.console = {
//     ...originalConsole,
//     log: () => {},    // log 메시지 숨김
//     info: () => {},   // info 메시지 숨김
//     warn: () => {},   // warning 메시지 숨김
//     error: originalConsole.error  // error는 유지
// }

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

app.use(pinia)
app.use(router);
app.mount('#app');
