<script lang="ts" setup>
import type { Item } from "~/schemas/item.schema";

type OnDelete = { act: "delete"; id: string | number };
type OnUpdate = {
  act: "update";
  id: string | number;
  state: { title: string; description: string; updated: string | Date };
};
type OnCreate = {
  act: "create";
  state: {
    title: string;
    description: string;
    unit: string;
    category: string;
    barcode: number;
  };
};

const props = withDefaults(
  defineProps<{
    message: string;
    label?: {
      continue?: string;
      cancel?: string;
    };
  }>(),
  {
    label: () => {
      return {
        cancel: "Batal",
        continue: "Lanjut",
      };
    },
  }
);

const emit = defineEmits(["continue", "cancel"]);
</script>

<template>
  <UModal>
    <UCard>
      <div class="space-y-2">
        <h6>{{ message }}</h6>
        <UButton @click="emit('continue')" class="w-min-20 justify-center mr-3">
          {{ label.continue }} </UButton
        ><UButton
          @click="emit('cancel')"
          class="w-min-20 justify-center"
          color="red"
        >
          {{ label.cancel }}
        </UButton>
      </div>
    </UCard>
  </UModal>
</template>
