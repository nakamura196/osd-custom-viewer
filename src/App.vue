<script setup lang="ts">
import OsdCustomViewer from "../lib/OsdCustomViewer.vue";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
const page = ref<number>(1);
const manifest = ref<string>("");
const route = useRoute();
const updatePage = (value: number) => {
  page.value = value;
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
  regions.value = [];
  manifest.value = "https://www.dl.ndl.go.jp/api/iiif/3437686/manifest.json";
  page.value = 1;
};

const ex02 = () => {
  regions.value = [
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=2028,644,1452,1992",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=544,620,1452,2000",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/91#xywh=470,686,1548,1991",
  ];
  manifest.value = "https://www.dl.ndl.go.jp/api/iiif/2567061/manifest.json";
  page.value = 69;
};

const ex03 = () => {
  regions.value = [
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=2028,644,1452,1992",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/69#xywh=544,620,1452,2000",
    "https://dl.ndl.go.jp/api/iiif/2567061/canvas/91#xywh=470,686,1548,1991",
    // "https://dl.ndl.go.jp/api/iiif/2567061/canvas/91#xywh=470,686,1548,1991"
  ];
  manifest.value = "https://www.dl.ndl.go.jp/api/iiif/2567061/manifest.json";
  page.value = 91;
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
  </div>

  <div style="margin-bottom: 8px">
    <h3>ページネーション</h3>

    <p>Page: {{ page }}</p>

    <h4>コンポーネントの外からページネーション</h4>

    <button @click="move(1)" style="margin: 4px">+</button>
    <button @click="move(-1)" style="margin: 4px">-</button>
  </div>

  <OsdCustomViewer
    v-if="manifest"
    @page="updatePage"
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
