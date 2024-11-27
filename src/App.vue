<template>
  <div id="appBox">
    <div class="nav">
      <Nav />
    </div>

    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import Nav from "./components/Nav.vue";
import { useGlobalStore } from "./store";

const { setJavaInfo, getNginxState, getPgState } = useGlobalStore();
const getJavaVersion = async () => {
  const data: string = await window.ipcRenderer.invoke("get-java-version");
  setJavaInfo(data.split("\r\n")[0]);
};

onMounted(() => {
  getJavaVersion();
  getNginxState();
  getPgState();
});
</script>

<style scoped lang="less">
#appBox {
  display: flex;
  div.nav {
    width: 90px;
    // background-color: aqua;
    height: 100vh;
    border-right: 1px solid #f0f0f0;
    // padding: 20px 0;
    box-sizing: border-box;
    flex-shrink: 0;
  }
  div.content {
    flex-shrink: 1;
    flex-grow: 1;
    box-sizing: border-box;
    padding: 10px;
    display: block;
    overflow: auto;
    height: 100vh;
    // background-color: aquamarine;
  }
}
</style>
