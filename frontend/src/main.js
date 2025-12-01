import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";

// Tạo và gắn kết Vue App với Router
createApp(App).use(router).mount("#app");
