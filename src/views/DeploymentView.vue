<template>
  <div id="nginxBox">
    <table>
      <thead>
        <tr>
          <th>名称</th>
          <th>监听端口</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>nginx</td>
          <td>8080</td>
          <td>{{ states.nginxRunning ? "运行中" : "已停止" }}</td>
          <td class="operation">
            <StopOutlined
              style="color: red"
              @click="handleNginx('stop')"
              v-if="states.nginxRunning"
            />
            <PlayCircleOutlined
              v-else
              style="color: var(--mainColor)"
              @click="handleNginx('start')"
            />
            <!-- <ReloadOutlined
              v-if="states.nginxRunning"
              @click="handleNginx('reload')"
            /> -->
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import {
  PlayCircleOutlined,
  StopOutlined,
  ReloadOutlined,
} from "@ant-design/icons-vue";
import { useGlobalStore } from "../store";
import { onMounted } from "vue";

const { states, getNginxState } = useGlobalStore();
const handleNginx = async (op: string) => {
  const data = await window.ipcRenderer.invoke("handleNginx", { op });
  const t = setTimeout(async () => {
    await getNginxState();
    clearTimeout(t);
  }, 1000);
};

onMounted(() => {
  getNginxState();
});
</script>

<style scoped lang="less">
#nginxBox {
  table {
    width: 100%;
    border: 1px solid #e0e0e0;
    border-collapse: collapse;
  }
  td,
  th {
    border: 1px solid #e0e0e0;
    padding: 4px;
    font-size: 14px;
    text-align: center;
  }
  td.operation {
    width: 14%;
    span {
      font-size: 20px;
      margin: 0 5px;
      cursor: pointer;
    }
  }
}
</style>
