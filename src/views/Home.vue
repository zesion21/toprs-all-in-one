<template>
  <div id="HomeBox">
    <div class="body">
      <div>
        <a-button type="primary" @click="startAll"> 一键启动 </a-button>
      </div>

      <div>
        <Steps :items="items" :current="states.current"></Steps>
      </div>
    </div>

    <div class="bottom">
      <ul>
        <h3>运行状态</h3>

        <li>数据库运行状态：{{ states.pgRunning ? "运行中" : "已停止" }}</li>
        <li>nginx运行状态：{{ states.nginxRunning ? "运行中" : "已停止" }}</li>
        <li>java运行状态：{{ states.jRunning ? "运行中" : "已停止" }}</li>
      </ul>

      <div class="start">
        <a-button type="primary" @click="openWeb"> 打开网站 </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  HddOutlined,
  DeploymentUnitOutlined,
  CodeOutlined,
  CheckOutlined,
} from "@ant-design/icons-vue";
import { message, StepProps, Steps } from "ant-design-vue";
import { h, ref } from "vue";
import { useGlobalStore } from "../store";
const items = [
  {
    title: "数据库",
    icon: h(HddOutlined),
  },
  {
    title: "nginx",

    icon: h(DeploymentUnitOutlined),
  },
  {
    title: "Java",

    icon: h(CodeOutlined),
  },
  {
    title: "完成",
    icon: h(CheckOutlined),
  },
] as StepProps[];

// const current = ref<number>(-1);
const { states, getPgState, getNginxState } = useGlobalStore();
const startAll = async () => {
  states.current = -1;

  try {
    states.pgRunning
      ? console.log("pg is running")
      : await window.ipcRenderer.invoke("startPg");

    states.current++;

    if (states.nginxRunning) {
      states.current++;
    } else {
      const { code } = await window.ipcRenderer.invoke("handleNginx", {
        op: "start",
      });

      if (code == 200) {
        states.current++;
      } else {
        throw new Error("nginx启动失败");
      }
    }

    states.nginxRunning
      ? console.log("jar is running")
      : await window.ipcRenderer.invoke("start-jar");
    states.current++;
    states.jRunning = true;
  } catch (error) {
    message.error(error + "");
  } finally {
    const t = setTimeout(() => {
      getPgState();
      getNginxState();
      openWeb();
      states.current++;
      clearTimeout(t);
    }, 2000);
  }
};

const openWeb = () => {
  window.ipcRenderer.send("openWeb", "_blank");
};
</script>

<style scoped lang="less">
#HomeBox {
  .body {
    display: flex;
    padding: 10px 0;
    // flex-direction: row-reverse;
  }
  .body > div:nth-child(1) {
    flex-shrink: 0;
    width: 120px;
  }
  .body > div:nth-child(2) {
    flex-grow: 1;
    padding-right: 30px;
  }

  .bottom {
    height: calc(100vh - 80px);
    display: flex;
    align-content: center;
    align-items: center;

    ul {
      width: 50%;
      flex-shrink: 0;
      // background-color: aquamarine;
      text-align: center;
      h3 {
        margin-bottom: 30px;
        font-size: 16px;
        font-weight: 400;
        color: rgb(59, 59, 59);
      }
      li {
        margin-bottom: 13px;
        font-size: 14px;
        color: rgb(59, 59, 59);
      }
    }

    div.start {
      flex-grow: 1;
      text-align: center;
    }
    // background-color: aqua;
  }
}
</style>
