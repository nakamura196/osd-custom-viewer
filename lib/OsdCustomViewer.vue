<script setup lang="ts">
import { onMounted, watch, computed } from "vue";
import OpenSeadragon from "openseadragon";

let viewer: any = null;
let currentProps: any = {};
let page = 1;
let canvases: any[] = [];



const size = computed(() => {
    return canvases.length
})

defineExpose({
    size
})

let overlays: any = {};
let seletedRegion: string = "";

const createid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (a) {
    let r = (new Date().getTime() + Math.random() * 16) % 16 | 0,
      v = a == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const props = withDefaults(
  defineProps<{
    id?: string;
    height?: number;
    width?: string;
    manifest: string;
    page?: number;
    canvas_id?: string;
    background_color?: string;
    prefix_url?: string;
    regions?: any;
    show_all?: boolean;
    selected_id?: string;
    hover_id?: string;
    mode?: string;
    use_custom_buttons?: boolean
  }>(),
  {
    id: "",
    height: 600,
    width: "100%",
    manifest: "",
    page: 1,
    canvas_id: "",
    background_color: "black",
    prefix_url: "./images/",
    regions: [],
    show_all: false,
    selected_id: "",
    hover_id: "",
    mode: "light",
    use_custom_buttons: false
  }
);

const emit = defineEmits<{
  (action: string, pageInfo: any): void;
}>();

let id = createid();
if (props.id !== "") {
  id = props.id;
}

let background_color = props.background_color;
if (props.mode === "light") {
  background_color = "lightgray";
}

// init
const init = async () => {
  // const manifest = props.manifest;

  const tileSources: string[] = [];

  const res = await fetch(props.manifest);
  const data: any = await res.json();

  canvases = data.sequences[0].canvases;

  for (const canvas_ of canvases) {
    tileSources.push(canvas_.images[0].resource.service["@id"] + "/info.json");
  }

  if (viewer) {
    viewer.destroy();
  }

  const config: any = {
    sequenceMode: true,
    id: "osd-" + id,
    prefix_url: props.prefix_url,
    tileSources
  }

  if(props.use_custom_buttons) {
    config["zoomInButton"] = `osv-${id}-zoom-in`
    config["zoomOutButton"] = `osv-${id}-zoom-out`
    config["homeButton"] = `osv-${id}-home-button`
    config["nextButton"] = `osv-${id}-next`
    config["previousButton"] = `osv-${id}-previous`
  }

  viewer = OpenSeadragon(config);

  // viewer.container.dir = "rtl";

  // ビューア側のページ遷移
  viewer.addHandler("page", function (event: any) {
    updateOverlay(event.page + 1);

    emit("updated", {
      page: event.page + 1,
      canvas: canvases[event.page]["@id"],
    });
  });

  // currentProps.manifest = manifest;
};

//オーバーレイを作成する
const createOverlays = () => {
  overlays = {};

  // canvas_id毎のxywhsを作成する
  const regionsByCanvas: any = {};

  for (const region_ of props.regions) {
    const spl = region_.split("#xywh=");

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

      const member_id = canvas_id + "#xywh=" + xywh_str;

      const id = member_id;

      const overlay = {
        id,
        x,
        y,
        width,
        height,
      };

      overlays[page].push(overlay);
    }
  }
};

// 外部からのページネーション
const move = () => {
  viewer.goToPage(page - 1);
};

const updateOverlay = (page: number) => {
  viewer.clearOverlays();
  if (overlays[page]) {
    for (const overlay of overlays[page]) {
      viewer.addOverlay(overlay);

      new OpenSeadragon.MouseTracker({
        element: overlay.id,
        clickHandler: function (e: any) {
          if (e) {
            const id = e.originalTarget.id;
            var target: any = document.getElementById(id);

            // すべての要素からselectedを削除
            const e2 = document.getElementsByClassName("selected");
            for (let i = 0; i < e2.length; i++) {
              e2[i].classList.remove("selected");
            }

            target.classList.add("selected");

            seletedRegion = target.id;

            emit("updatedSeletecd", {
              selected_id: seletedRegion,
            });
          }
        },
      });
    }
  }
};

const addSelectOverlay = () => {
  for (const page in overlays) {
    for (const overlay of overlays[page]) {
      if (seletedRegion === overlay.id) {
        overlay.className += " selected";
      } else {
        overlay.className = overlay.className.split(" selected").join(""); //複数の場合あり
      }

      if (props.hover_id === overlay.id) {
        overlay.className += " hover";
      } else {
        overlay.className = overlay.className.replace(" hover", "");
      }
    }
  }
};

const showOverlay = () => {
  for (const page in overlays) {
    for (const overlay of overlays[page]) {
      overlay.className = "base highlight";
    }
  }
};

const hideOverlay = () => {
  for (const page in overlays) {
    for (const overlay of overlays[page]) {
      overlay.className = "base";
    }
  }
};

// propsが更新されたら
watch(
  props,
  async (value) => {
    //要検討
    if (props.selected_id && props.selected_id !== currentProps.region) {
      seletedRegion = props.selected_id;
    }

    //マニフェストが変わったら再初期化
    if (value.manifest !== currentProps.manifest) {
      //destory
      if (viewer) {
        viewer.destroy();
      }

      await init();
    }

    // regionに変化があったら
    if (
      !currentProps.regions ||
      currentProps.regions.join(",") !== value.regions.join(",")
    ) {
      //オーバーレイを作成する
      createOverlays();
    }

    //表示切り替え
    if (value.show_all) {
      showOverlay();
    } else {
      hideOverlay();
    }

    addSelectOverlay();

    updateOverlay(currentProps.page);

    // ページ設定
    if (props.canvas_id) {
      // canvasが指定されていた場合、pageを設定する
      for (let i = 0; i < canvases.length; i++) {
        if (canvases[i]["@id"] === props.canvas_id) {
          page = i + 1;
          break;
        }
      }
    } else if (props.page) {
      page = props.page;
    }

    if (currentProps.page !== page) {
      move();
    }

    currentProps = Object.assign({}, value);
    currentProps.page = page;
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div :style="`background-color: ${background_color};`">
    <div
      :id="`osd-${id}`"
      :style="`height: ${height}px; width: ${width};`"
    ></div>
  </div>
</template>
<style scoped>
:deep(.highlight) {
  outline: solid #03a9f4;
}

:deep(.selected) {
  outline: solid #ffeb3b !important;
}

:deep(.hover) {
  outline: solid #9c27b0;
}

:deep(.base:hover, .base:focus) {
  outline: solid #9c27b0;
}
</style>
