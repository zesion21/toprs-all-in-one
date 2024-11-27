<template>
  <ul id="nav">
    <li
      v-for="(item, i) in menu"
      :class="{ select: selectI == i }"
      @click="routeTo(i, item.path)"
    >
      <div><component :is="icons[i]" /></div>
      <h5>{{ item.name }}</h5>
    </li>
  </ul>
</template>

<script setup lang="ts">
import {
  HomeOutlined,
  HddOutlined,
  DeploymentUnitOutlined,
  CodeOutlined,
} from "@ant-design/icons-vue";
import { ref } from "vue";
import { useRouter } from "vue-router";

const selectI = ref<number>(0);
const { push } = useRouter();

const icons = [HomeOutlined, HddOutlined, DeploymentUnitOutlined, CodeOutlined];

const menu = [
  {
    name: "首页",
    path: "/",
  },
  {
    name: "数据库",
    path: "/database",
  },
  {
    name: "NGINX",
    path: "/nginx",
  },
  {
    name: "Java",
    path: "/codeout",
  },
];

const routeTo = (i: number, path: string) => {
  selectI.value = i;
  push({ path });
};
</script>

<style scoped lang="less">
ul#nav {
  list-style-type: none;
  li {
    height: 80px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    div,
    h5 {
      text-align: center;
      overflow: hidden;
    }
    div {
      font-size: 26px;
      color: #5e5e5e;
      transition: all 0.1s;
    }
    h5 {
      transition: all 0.1s;
      height: 22px;
      color: #5e5e5e;
      text-decoration: none;
    }
  }

  li.select {
    div {
      font-size: 32px;
      color: rgb(80, 63, 233);
    }

    h5 {
      height: 0;
    }
  }

  li.select::before {
    content: "";
    display: inline-block;
    width: 4px;
    height: 50px;
    top: 15px;
    position: absolute;
    background-color: rgb(80, 63, 233);
    border-radius: 2px;
    left: 1px;
  }
}
</style>
