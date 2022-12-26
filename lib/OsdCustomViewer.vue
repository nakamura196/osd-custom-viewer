<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import OpenSeadragon, { Overlay } from "openseadragon";

// const title = ref<string>("");
// const attribution = ref<string>("");

const viewer = ref<any>();

const currentManifest = ref<string>("");

const props = withDefaults(
  defineProps<{
    height?: number;
    width?: string;
    manifest?: string;
    page?: number;
    backgroundColor?: string;
    prefixUrl?: string;
    regions?: any;
  }>(),
  {
    height: 600,
    width: "100%",
    manifest: "",
    page: 1,
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

let canvases: any[] = [];
let overlays: any = {};

const init = async () => {
  const manifest = props.manifest;

  if (!manifest) {
    return;
  }

  currentManifest.value = manifest;

  const tileSources: string[] = [];

  const res = await fetch(props.manifest);
  const data: any = await res.json();

  // title.value = data.label;
  // attribution.value = data.attribution;

  canvases = data.sequences[0].canvases;
  for (const canvas of canvases) {
    tileSources.push(canvas.images[0].resource.service["@id"] + "/info.json");
  }

  viewer.value = OpenSeadragon({
    sequenceMode: true,
    id: "openseadragon",
    prefixUrl: props.prefixUrl,
    tileSources,
  });

  //オーバーレイを作成する
  createOverlays();

  //移動
  move();

  viewer.value.addHandler("page", function (event: any) {
    emit("page", event.page + 1);
  });
};

const createOverlays = () => {
  overlays = {};

  // canvas_id毎のxywhsを作成する
  const regionsByCanvas: any = {};

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
  viewer.value.goToPage(page - 1);

  //当該ページのオーバーレイを追加
  overlay();
};

const overlay = () => {
  if (overlays[props.page]) {
    for (const overlay of overlays[props.page]) {
      viewer.value.addOverlay(overlay);
    }
  }
};

watch(
  props,
  (value) => {
    if (!viewer.value) {
      return;
    }

    //マニフェストが変わったら再初期化
    if (value.manifest !== currentManifest.value) {
      viewer.value.destroy();
      init();
      return;
    }

    move();

    // overlay()
  },
  { deep: true }
);
</script>

<template>
  <div
    id="openseadragon"
    :style="`height: ${height}px; width: ${width}; background-color: ${backgroundColor};`"
  ></div>
</template>
<style>
.highlight {
  opacity: 0.3;
  background-color: #e9dc51;
}
</style>
