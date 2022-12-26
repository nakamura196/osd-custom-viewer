<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import OpenSeadragon from "openseadragon";
import axios from "axios";

const title = ref<string>("");
const attribution = ref<string>("");

const viewer = ref<any>();

const props = withDefaults(
  defineProps<{
    height?: number;
    width?: string;
    manifest?: string;
    page?: number;
    backgroundColor?: string;
    prefixUrl?: string;
  }>(),
  {
    height: 600,
    width: "100%",
    manifest: "",
    page: 1,
    backgroundColor: "black",
    prefixUrl: "./images/",
  }
);

const emit = defineEmits<{
  (action: string, page: number): void;
}>();

onMounted(async () => {
  const manifest = props.manifest;

  if (!manifest) {
    return;
  }

  const tileSources: string[] = [];

  const { data } = await axios.get(props.manifest);
  title.value = data.label;
  attribution.value = data.attribution;

  const canvases = data.sequences[0].canvases;
  for (const canvas of canvases) {
    tileSources.push(canvas.images[0].resource.service["@id"] + "/info.json");
  }

  viewer.value = OpenSeadragon({
    sequenceMode: true,
    id: "openseadragon",
    prefixUrl: props.prefixUrl,
    tileSources,
  });

  viewer.value.addHandler("page", function (event: any) {
    emit("page", event.page + 1);
  });
});

watch(
  props,
  (value) => {
    if (!viewer.value) {
      return;
    }
    const page = value.page;
    viewer.value.goToPage(page - 1);
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
