<template>
  <div id="CodeoutBox">
    <ul class="content">
      <li>
        <span class="title"> 报销填报系统后台 </span>

        <div>
          <PoweroffOutlined
            @click="killJar"
            v-if="states.jRunning"
            style="color: #f00"
          />

          <PlayCircleOutlined @click="startJar" v-else />

          <FolderOpenOutlined @click="openPath" title="打开文件目录" />
        </div>
      </li>

      <li>
        <div v-for="item in datas.info">{{ item }}</div>
      </li>
    </ul>

    <div class="footer">
      <span class="state" :class="{ staterun: states.jRunning }"> 运行状态 </span>
      <span>Java环境：{{ javaInfo }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useGlobalStore } from "../store";
import {
  FolderOpenOutlined,
  PoweroffOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

const { javaInfo, states } = useGlobalStore();

const datas = reactive<{
  info: string[];
  // isRunning: boolean;
}>({ info: [] });

const startJar = () => {
  window.ipcRenderer
    .invoke("start-jar")
    .then((res) => {
      states.jRunning = true;
    })
    .catch((err) => {
      message.error(err);
    });
};
const killJar = () => {
  window.ipcRenderer.send("kill-jar");
};

const openPath = () => {
  window.ipcRenderer.send("open-path", "E:/");
};

onMounted(() => {
  window.ipcRenderer.on("jarData", (event, value: string) => {
    const ll = value.split("\n").filter((i) => i.length > 0);

    if (ll.some((i) => i.includes("已退出"))) {
      states.jRunning = false;
    }

    datas.info.push(...ll);
  });
});
</script>

<style scoped lang="less">
#CodeoutBox {
  ul.content {
    width: 100%;
    height: calc(100vh - 45px);
    li:nth-child(1) {
      margin-bottom: 3px;
      display: flex;
      justify-content: space-between;
      div {
        padding-right: 10px;
        font-size: 20px;
        color: #1980ff;
        span {
          margin-left: 10px;
          cursor: pointer;
        }
      }
    }

    li:nth-child(2) {
      background-color: black;
      height: calc(100% - 34px);
      color: rgb(61, 190, 89);
      overflow: auto;
      div {
        font-size: 14px;
        letter-spacing: 1px;
        font-weight: 400;
      }
    }
  }

  @keyframes shake {
    0% {
      opacity: 1;
    }

    50% {
      opacity: 0.5;
    }

    100% {
      opacity: 1;
    }
  }

  div.footer {
    display: flex;
    justify-content: space-between;
    color: #5a5a5a;
    font-size: 14px;
    position: relative;

    span.state::after {
      content: "";
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1px solid #f7f7f7;

      position: absolute;
      top: 5px;
      margin-left: 5px;
      background: radial-gradient(rgba(255, 0, 0, 0.35), red);
    }

    span.staterun::after {
      background: radial-gradient(rgba(0, 255, 0, 0.35), green);
      animation: shake 3s linear infinite;
    }
  }
}
</style>
