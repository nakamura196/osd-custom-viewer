<script setup lang="ts">
import { onMounted, watch } from "vue";
import OpenSeadragon from "openseadragon";

let viewer: any = null;
let currentProps: any = {};
let page = 1;
let canvases: any[] = [];
let overlays: any = {};
let seletedRegion: string = "";

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
    showAll?: boolean;
    region?: string;
    hover?: string;
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
    showAll: false,
    region: "",
    hover: "",
  }
);

const emit = defineEmits<{
  (action: string, pageInfo: any): void;
}>();

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

  viewer = OpenSeadragon({
    sequenceMode: true,
    id: "osd-" + uuid,
    prefixUrl: props.prefixUrl,
    tileSources,
  });

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

  // currentRegion = props.regions;
};

// 外部からのページネーション
const move = () => {

  if(props.canvas) {
    // canvasが指定されていた場合、pageを設定する
    for (let i = 0; i < canvases.length; i++) {
      if (canvases[i]["@id"] === props.canvas) {
        page = i + 1;
        break;
      }
    }
  }

  if(props.page) {
    page = props.page;
  }

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
            // currentCanvas + target.id.replace("overlay-", "#xywh=");

            emit("updatedSeletecd", {
              region: seletedRegion,
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
      } else  {
        overlay.className = overlay.className.split(" selected").join(""); //複数の場合あり
      }

      if (props.hover === overlay.id) {
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
      /*
      if (seletedRegion && seletedRegion === overlay.id) {
        overlay.className = "base highlight selected";
      }
      */
    }
  }
};

const hideOverlay = () => {
  for (const page in overlays) {
    for (const overlay of overlays[page]) {
      overlay.className = "base";
      /*
      if (seletedRegion && seletedRegion === overlay.id) {
        overlay.className = "base highlight selected";
      }
      */
    }
  }
};

// propsが更新されたら
watch(
  props,
  async (value) => {
    //要検討
    if (props.region && props.region !== currentProps.region) {
      seletedRegion = props.region;
    }

    //マニフェストが変わったら再初期化
    if (value.manifest !== currentProps.manifest) {
      //destory
      if (viewer) {
        viewer.destroy();
      }

      await init();

      createOverlays();

      if (value.showAll) {
        showOverlay();
      } else {
        hideOverlay();
      }

      addSelectOverlay();

      if (currentProps.page !== value.page || currentProps.canvas !== value.canvas) {
        move();
      } else {
        updateOverlay(currentProps.page);
      }
    } else {
      // あとで整理
      // regionに変化があったら
      if (
        !currentProps.regions ||
        currentProps.regions.join(",") !== value.regions.join(",")
      ) {
        //オーバーレイを作成する
        createOverlays();

        if (value.showAll) {
          showOverlay();
        } else {
          hideOverlay();
        }

        addSelectOverlay();
        updateOverlay(currentProps.page);

        if (currentProps.page !== value.page || currentProps.canvas !== value.canvas) {
          move();
        }
      } else {

        // visibleに変化があったら
        if (currentProps.showAll !== value.showAll) {
          if (value.showAll) {
            showOverlay();
          } else {
            hideOverlay();
          }

          currentProps.showAll = value.showAll;

          //ページが移動しない場合, または regionに変化があった場合
          if (currentProps.page === value.page) {
            updateOverlay(currentProps.page);
          }
        }

        // regionに更新があれば //要検討
        if (props.region && props.region !== currentProps.region) {
          addSelectOverlay();
          updateOverlay(currentProps.page);
        }

        if (currentProps.page !== value.page || currentProps.canvas !== value.canvas) {
          move();
        }
      }
    }

    if(currentProps.hover !== value.hover) {
      // hover = value.hover;
      addSelectOverlay();
      updateOverlay(currentProps.page);
    }

    currentProps = Object.assign({}, value);
  },
  { deep: true, immediate: true }
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
