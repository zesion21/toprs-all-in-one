<template>
  <div id="DatabaseBox">
    <div class="title">
      <span>Postgres数据库</span>

      <span style="font-size: 20px; cursor: pointer">
        <PoweroffOutlined
          style="color: #f00"
          v-if="states.pgRunning"
          @click="killPg"
        />
        <PlayCircleOutlined style="color: #1890ff" @click="startPg" v-else />
      </span>
    </div>
    <div class="content" id="contentDB">
      <ul>
        <li v-for="item in datas.list">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayCircleOutlined, PoweroffOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { onMounted, reactive } from "vue";
import { useGlobalStore } from "../store";
const { states, getPgState } = useGlobalStore();
const datas = reactive<{ list: string[] }>({ list: [] });

const startPg = () => {
  window.ipcRenderer
    .invoke("startPg")
    .then((r) => {
      states.pgRunning = true;
    })
    .catch((err) => message.error(err));
};
const killPg = async () => {
  window.ipcRenderer
    .invoke("killPg")
    .then(({ code, msg }) => {
      if (code < 0) {
        message.error(msg);
      }
    })
    .catch((err) => console.log(err));
};

onMounted(() => {
  const el = document.getElementById("contentDB");
  window.ipcRenderer.on("pgMsg", (evt, { type, msg }) => {
    if (type == "close") {
      states.pgRunning = false;
    }
    datas.list.push(msg);
    const t = setTimeout(() => {
      el?.scrollTo({ top: el?.scrollHeight });
      clearTimeout(t);
    }, 100);
  });

  getPgState();
});
</script>

<style scoped lang="less">
#DatabaseBox {
  .title {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }
  .content {
    height: calc(100vh - 58px);
    background-color: rgb(32, 32, 32);
    overflow: auto;
    padding: 2px;
    box-sizing: border-box;
    li {
      color: rgb(0, 148, 0);
    }
  }

  div.content::-webkit-scrollbar {
    width: 6px;
  }

  div.content::-webkit-scrollbar-thumb {
    background-color: #a3a3a3;
    margin-right: 3px;
    border-radius: 4px;
  }
}
</style>
