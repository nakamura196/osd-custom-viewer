<script setup lang="ts">
import OsdCustomViewer from "../lib/OsdCustomViewer.vue";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
const page = ref<number>(1);
const manifest = ref<string>("");
const canvas = ref<string>("");
const route = useRoute();
const updatePage = (value: any) => {
  page.value = value.page;
  canvas.value = value.canvas
};
onMounted(() => {
  manifest.value =
    route && route.query.manifest
      ? String(route.query.manifest)
      : "https://www.dl.ndl.go.jp/api/iiif/3437686/manifest.json";
});

const move = (value: number) => {
  page.value += value;
};

const regions = ref<string[]>([]);

const ex01 = () => {
  canvas.value = ""
  regions.value = [];
  manifest.value = "https://www.dl.ndl.go.jp/api/iiif/3437686/manifest.json";
  page.value = 1;
};

const ex02 = () => {
  canvas.value = ""
  regions.value = [
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=2028,644,1452,1992",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=544,620,1452,2000",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/91#xywh=470,686,1548,1991",
  ];
  manifest.value = "https://www.dl.ndl.go.jp/api/iiif/2567061/manifest.json";
  page.value = 69;
};

const ex03 = () => {
  canvas.value = ""
  regions.value = [
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=2028,644,1452,1992",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=544,620,1452,2000",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/91#xywh=470,686,1548,1991",
    // "https://dl.ndl.go.jp/api/iiif/2567061/canvas/91#xywh=470,686,1548,1991"
  ];
  manifest.value = "https://www.dl.ndl.go.jp/api/iiif/2567061/manifest.json";
  page.value = 91;
};

const ex04 = () => {
  regions.value = [];
  canvas.value = "https://dl.ndl.go.jp/api/iiif/3437686/canvas/6";
  manifest.value = "https://www.dl.ndl.go.jp/api/iiif/3437686/manifest.json";
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
  </div>

  <div style="margin-bottom: 8px">
    <h3>ページネーション</h3>

    <p>Page: {{ page }}</p>

    <p>Canvas: {{ canvas }}</p>

    <h4>コンポーネントの外からページネーション</h4>

    <button @click="move(1)" style="margin: 4px">+</button>
    <button @click="move(-1)" style="margin: 4px">-</button>
  </div>

  <OsdCustomViewer
    v-if="manifest"
    :canvas="canvas"
    @updated="updatePage"
    :manifest="manifest"
    :page="page"
    :regions="regions"
  />

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
