import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useGlobalStore = defineStore("globalStore", () => {
  const javaInfo = ref<string>("未获取到jre信息");

  // 状态信息
  const states = reactive({
    jRunning: false,
    pgRunning: false,
    nginxRunning: false,
    current: -1,
  });

  const setJavaInfo = (info: string) => (javaInfo.value = info);

  const getNginxState = async () => {
    const { code, msg } = await window.ipcRenderer.invoke("getNginxState");
    states.nginxRunning = code == 200;
  };

  const getPgState = async () => {
    const { code, msg } = await window.ipcRenderer.invoke("getPgState");
    states.pgRunning = code == 200;
  };

  return { setJavaInfo, javaInfo, states, getNginxState, getPgState };
});
