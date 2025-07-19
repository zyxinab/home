import { createApp } from "vue";
import "@/style/style.scss";
import App from "@/App.vue";
// 引入 pinia
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
// swiper
import "swiper/css";
// Element Plus
import { ElMessage } from "element-plus";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// 全局注册 ElMessage
app.config.globalProperties.$message = ElMessage;
window.ElMessage = ElMessage;

app.use(pinia);
app.mount("#app");

// PWA
navigator.serviceWorker.addEventListener("controllerchange", () => {
  // 弹出更新提醒
  console.log("站点已更新，刷新后生效");
  ElMessage("站点已更新，刷新后生效");
});
