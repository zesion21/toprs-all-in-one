import { createApp } from "vue";
import "./style.less";
import App from "./App.vue";
import { router } from "./router";
import { Button } from "ant-design-vue";

import { createPinia } from "pinia";

const app = createApp(App);

app.use(router);
app.use(Button);
app.use(createPinia());
app.mount("#app");
