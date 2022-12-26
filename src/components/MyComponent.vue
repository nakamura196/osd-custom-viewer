<template>
  <button @click="click">{{ name }}</button>
</template>

<script lang="ts" setup>
const props = defineProps<{
  name: string
}>();
const emit = defineEmits<{
  (e: "click", message: string): void
}>();
const click = () => emit("click", "MyButton clicked!!!")
</script>