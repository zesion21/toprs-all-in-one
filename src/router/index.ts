import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("../views/Home.vue"),
    name: "首页",
  },
  {
    path: "/database",
    component: () => import("../views/DatebaseView.vue"),
    name: "数据库",
  },
  {
    path: "/nginx",
    component: () => import("../views/DeploymentView.vue"),
    name: "NGINX",
  },
  {
    path: "/codeout",
    component: () => import("../views/CodeOutView.vue"),
    name: "Java控制台",
  },
  // {
  //   path: "/",
  //   component: () => import("../views/Home.vue"),
  //   name: "首页",
  // },
];

export const router = createRouter({
  routes,
  history: createWebHashHistory(import.meta.env.BASE_URL),
});
