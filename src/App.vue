<script setup lang="ts">
import OsdCustomViewer from "../lib/OsdCustomViewer.vue";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
const page = ref<number>(1);
const manifest = ref<string>("");
const canvas_id = ref<string>("");
const route = useRoute();
const selected_id = ref<string>("");
// const viewer = ref<any>(null);
const hover_id = ref<string>("");


const updatePage = (value: any) => {
  page.value = value.page;
  canvas_id.value = value.canvas_id;
};
/*
*/

const updatedSeletecd = (value: any) => {
  selected_id.value = value.selected_id;
};

onMounted(() => {
  manifest.value =
    route && route.query.manifest
      ? String(route.query.manifest)
      : "https://www.dl.ndl.go.jp/api/iiif/3437686/manifest.json";

  // これを実行
  ex02();
});

const ocv = ref<any>(null);

const move2 = (value: number) => {
  page.value += value;
  canvas_id.value = ocv.value.canvases[page.value - 1];
};

const regions = ref<string[]>([]);

const ex01 = () => {
  canvas_id.value = "";
  regions.value = [];
  manifest.value = "https://www.dl.ndl.go.jp/api/iiif/3437686/manifest.json";
};

const ex02 = () => {
  canvas_id.value = "";
  regions.value = [
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/68#xywh=50,50,300,300",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=2028,644,1452,1992",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=544,620,1452,2000",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/70#xywh=500,500,300,300",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/91#xywh=470,686,1548,1991",
  ];
  manifest.value = "https://www.dl.ndl.go.jp/api/iiif/2567061/manifest.json";
  canvas_id.value = "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69"
};

const ex03 = () => {
  canvas_id.value = "";
  regions.value = [
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=2028,644,1452,1992",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=544,620,1452,2000",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/91#xywh=470,686,1548,1991",
    // "https://dl.ndl.go.jp/api/iiif/2567061/canvas/91#xywh=470,686,1548,1991"
  ];
  manifest.value = "https://www.dl.ndl.go.jp/api/iiif/2567061/manifest.json";
  // page.value = 91;
  canvas_id.value = "https://dl.ndl.go.jp/api/iiif/2567061/canvas/91"
};

const ex04 = () => {
  regions.value = [];
  canvas_id.value = "https://dl.ndl.go.jp/api/iiif/3437686/canvas/6";
  manifest.value = "https://www.dl.ndl.go.jp/api/iiif/3437686/manifest.json";
};

const ex05 = () => {
  regions.value = [];
  canvas_id.value = "https://dl.ndl.go.jp/api/iiif/3437686/canvas/7";
  manifest.value = "https://www.dl.ndl.go.jp/api/iiif/3437686/manifest.json";
};

const isShowAll = ref<boolean>(false);

const showAll = () => {
  isShowAll.value = true;
};

const hideAll = () => {
  isShowAll.value = false;
};

const region1 = () => {
  selected_id.value =
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=2028,644,1452,1992";
};

const hover1 = () => {
  hover_id.value =
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=2028,644,1452,1992";
};

const mouseLeaveAction = () => {
  hover_id.value = "";
};

const region2 = () => {
  selected_id.value =
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=544,620,1452,2000";
};

const hover2 = () => {
  hover_id.value =
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=544,620,1452,2000";
};
</script>

<template>
  <div style="margin-bottom: 8px">
    <h3>サンプル</h3>

    <button style="margin: 4px" @click="ex01">
      デフォルト（校異源氏物語）
    </button>
    <button style="margin: 4px" @click="ex02">
      画像の一部をハイライト（絵入源氏物語）
    </button>
    <button style="margin: 4px" @click="ex03">
      他のページをハイライト（絵入源氏物語）
    </button>
    <button style="margin: 4px" @click="ex04">
      canvas_idで指定（校異源氏物語）
    </button>

    <button style="margin: 4px" @click="ex05">
      canvas_idで指定（校異源氏物語）
    </button>
  </div>

  <div style="margin-bottom: 8px">
    <h3>サンプル2</h3>

    <button style="margin: 4px" @click="showAll()">
      すべてのアノテーションを表示
    </button>

    <button style="margin: 4px" @click="hideAll()">
      すべてのアノテーションを隠す
    </button>

    <button
      style="margin: 4px"
      :style="
        selected_id ===
        'https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=2028,644,1452,1992'
          ? 'color: red;'
          : ''
      "
      @click="region1"
      v-on:mouseover="hover1"
      v-on:mouseleave="mouseLeaveAction"
    >
      region1
    </button>

    <button
      style="margin: 4px"
      :style="
        selected_id ===
        'https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=544,620,1452,2000'
          ? 'color: red;'
          : ''
      "
      @click="region2"
      @hover="hover2"
    >
      region2
    </button>
  </div>

  <div style="margin-bottom: 8px">
    <h3>ページネーション</h3>

    <p>Page: {{ page }}</p>

    <p>canvas_id: {{ canvas_id }}</p>

    <p>selected_id: {{ selected_id }}</p>

    <h4>コンポーネントの外からページネーション</h4>

    <button @click="move2(1)" style="margin: 4px">+</button>
    <button @click="move2(-1)" style="margin: 4px">-</button>
  </div>

  <div style="margin-bottom: 8px">
    <h3>カスタムバー</h3>
    <button id="osv-demo-zoom-in" style="margin: 4px">zoom-in</button>
    <button id="osv-demo-zoom-out" style="margin: 4px">zoom-out</button>
    <button id="osv-demo-home-button" style="margin: 4px">home-button</button>
    <button id="osv-demo-next" style="margin: 4px">next</button>
    <button id="osv-demo-previous" style="margin: 4px">previous</button>

    <template v-if="$refs.ocv && $refs.ocv.size > 0">
      <span style="margin: 4px">
        {{ page }} / {{ $refs.ocv.size }}
      </span>
    </template>
  </div>

  <OsdCustomViewer
    ref="ocv"
    id="demo"
    v-if="manifest"
    :canvas_id="canvas_id"
    @updated="updatePage"
    @updatedSeletecd="updatedSeletecd"
    :manifest="manifest"
    :regions="regions"
    :show_all="isShowAll"
    :selected_id="selected_id"
    :hover_id="hover_id"
    :use_custom_buttons="true"
  />

  <!-- 
    :page="page" -->

  {{ hover_id }}

  <div>
    <ul>
      <li>
        This demo application processes manifest files for which the IIIF
        Presentation API v.2 and Image API are enabled.
      </li>
      <li>
        本デモアプリケーションでは、IIIF Presentation API v.2 および Image API
        が有効なマニフェストファイルが処理対象です。
      </li>
    </ul>
  </div>
</template>
