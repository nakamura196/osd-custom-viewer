<script setup lang="ts">
import { onMounted, watch } from "vue";
import OpenSeadragon from "openseadragon";

let viewer: any = null;
let currentManifest = "";
let currentRegionString = "";
let canvases: any[] = [];
let overlays: any = {};

const createUuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (a) {
    let r = (new Date().getTime() + Math.random() * 16) % 16 | 0,
      v = a == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const uuid = createUuid();

const props = withDefaults(
  defineProps<{
    height?: number;
    width?: string;
    manifest?: string;
    page?: number;
    canvas?: string;
    backgroundColor?: string;
    prefixUrl?: string;
    regions?: any;
  }>(),
  {
    height: 600,
    width: "100%",
    manifest: "",
    page: 1,
    canvas: "",
    backgroundColor: "black",
    prefixUrl: "./images/",
    regions: [],
  }
);

const emit = defineEmits<{
  (action: string, page: number): void;
}>();

onMounted(async () => {
  await init();
});

const init = async () => {
  const manifest = props.manifest;

  if (!manifest) {
    return;
  }

  currentManifest = manifest;

  const tileSources: string[] = [];

  const res = await fetch(props.manifest);
  const data: any = await res.json();

  canvases = data.sequences[0].canvases;
  for (const canvas_ of canvases) {
    tileSources.push(canvas_.images[0].resource.service["@id"] + "/info.json");

    if(canvas_["@id"] === props.canvas){
      props.page = tileSources.length;
    }
  }

  viewer = OpenSeadragon({
    sequenceMode: true,
    id: "osd-" + uuid,
    prefixUrl: props.prefixUrl,
    tileSources,
  });

  //オーバーレイを作成する
  createOverlays();

  //移動
  move();

  viewer.addHandler("page", function (event: any) {
    emit("updated", event.page + 1);
  });
};

//オーバーレイを作成する
const createOverlays = () => {
  overlays = {};

  // canvas_id毎のxywhsを作成する
  const regionsByCanvas: any = {};

  currentRegionString = props.regions.join(",");

  for (const region of props.regions) {
    const spl = region.split("#xywh=");

    const canvas_id = spl[0];

    if (!regionsByCanvas[canvas_id]) {
      regionsByCanvas[canvas_id] = [];
    }

    regionsByCanvas[canvas_id].push(spl[1]);
  }

  for (const canvas_id in regionsByCanvas) {
    let index = -1;
    let fullWidth = -1;

    for (let i = 0; i < canvases.length; i++) {
      if (canvases[i]["@id"] === canvas_id) {
        index = i;
        fullWidth = canvases[i].width;
        break;
      }
    }

    const xywhs = regionsByCanvas[canvas_id];

    const page = index + 1;
    overlays[page] = [];

    for (const xywh_str of xywhs) {
      const xywh = xywh_str.split(",");

      const x = Number(xywh[0]) / fullWidth;
      const y = Number(xywh[1]) / fullWidth;
      const width = Number(xywh[2]) / fullWidth;
      const height = Number(xywh[3]) / fullWidth;

      const overlay = {
        x,
        y,
        width,
        height,
        className: "highlight",
      };

      overlays[page].push(overlay);
    }
  }
};

const move = () => {
  const page = props.page;
  viewer.goToPage(page - 1);

  //当該ページのオーバーレイを追加
  overlay();
};

const overlay = () => {
  if (overlays[props.page]) {
    for (const overlay of overlays[props.page]) {
      viewer.addOverlay(overlay);
    }
  }
};

// propsが更新されたら
watch(
  props,
  (value) => {
    if (!viewer) {
      return;
    }

    //マニフェストが変わったら再初期化
    if (value.manifest !== currentManifest) {
      //destory
      viewer.destroy();
      init();
      return;
    }

    if (currentRegionString !== value.regions.join(",")) {
      //オーバーレイを作成する
      createOverlays();
    }

    move();
  },
  { deep: true }
);
</script>

<template>
  <div
    :id="`osd-${uuid}`"
    :style="`height: ${height}px; width: ${width}; background-color: ${backgroundColor};`"
  ></div>
</template>
<style scoped>
:deep(.highlight) {
  opacity: 0.3;
  background-color: #e9dc51;
}
</style>
