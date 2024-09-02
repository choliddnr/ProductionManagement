<script setup lang="ts">
import { type Product } from "~/schemas/products.schema";
import { LazyModalConfirm } from "#components";
import type { SelfProduced } from "~/types/self_produced";
import { z } from "zod";
import type { FullSelfProduced, ItemInfo } from "../types";
const props = defineProps<{
  update?: { id: string; title: string };
}>();

const emits = defineEmits(["close"]);
const modal = useModal();
const toast = useToast();

const { data: itemOptions } = await useFetch<ItemInfo[]>(
  "/api/production/item_info"
);
const { selfProduced } = storeToRefs(useSelfProducedStore());

const SelfProducedSchema = z.object({
  item: z.string(),
  description: z.string().optional(),
});

const state = reactive<SelfProduced>({
  item: undefined,
  description: undefined,
});

/**
 * if update
 */
const sp = ref<FullSelfProduced>();
if (props.update) {
  await useFetch<FullSelfProduced>(
    "/api/production/self_produced/" + props.update.id,
    {
      onResponse: ({ response }) => {
        sp.value = response._data;
      },
    }
  );
  state.item = sp.value.item;
  state.description = sp.value.description;
}
const diabledSumbit = computed<boolean>(() => {
  if (!props.update) return false;
  if (state.description !== sp.value.description) return false;
  return true;
});

const onSubmit = async () => {
  modal.open(LazyModalConfirm, {
    label: {
      cancel: "Tinjau kembali",
      continue: "Lanjut",
    },
    message: "Apakah semua data sudah benar?",
    onCancel: () => {
      modal.close();
    },
    onContinue: async () => {
      if (!props.update) {
        await $fetch<Product>("/api/production/self_produced/", {
          method: "POST",
          body: state,
          onResponse: ({ response }) => {
            // addNewProduct(response._data);
            selfProduced.value.push(response._data);
            toast.add({
              description: "Pesanan berhasil dibuat",
            });
            modal.close();
            emits("close");
          },
          onResponseError: ({ error }) => {
            toast.add({
              color: "red",
              title: error.name,
              description: error.message,
            });
          },
        });
      } else {
        await $fetch<Product>(
          "/api/production/self_produced/" + props.update.id,
          {
            method: "PATCH",
            body: { description: state.description },
            onResponse: ({ response }) => {
              // addNewProduct(response._data);
              selfProduced.value = selfProduced.value.map((sp) => {
                if (sp.id !== props.update.id) return sp;
                return response._data;
              });
              toast.add({
                description: "Data berhasil diperbarui",
              });
              modal.close();
              emits("close");
            },
            onResponseError: ({ error }) => {
              toast.add({
                color: "red",
                title: error.name,
                description: error.message,
              });
            },
          }
        );
      }
    },
  });
};
</script>
<template>
  <UDashboardSlideover
    prevent-close
    :ui="{ header: { base: 'grid grid-cols-12' } }"
  >
    <template #header>
      <h3
        class="text-base font-semibold leading-6 text-gray-900 dark:text-white col-span-11"
      >
        {{ !update ? "Tambah Product" : "Edit " + update.title }}
      </h3>
      <div class="">
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark-20-solid"
          class="-my-1"
          @click="emits('close')"
        />
      </div>
    </template>

    <UForm
      :state="state"
      class="space-y-4"
      :schema="SelfProducedSchema"
      @submit="onSubmit"
    >
      <UFormGroup label="Item" name="item" v-if="!update">
        <USelectMenu
          v-model="state.item"
          :options="itemOptions"
          option-attribute="title"
          value-attribute="id"
          icon="i-heroicons-document-text"
          placeholder="Pilih Item"
        >
          <template #option="{ option: i }">
            <span class="truncate">{{ i.title }}</span>
          </template>
        </USelectMenu>
      </UFormGroup>
      <!-- <UFormGroup label="Harga" name="price">
        <UInput type="number" v-model="state.price" />
      </UFormGroup> -->
      <UFormGroup label="Descripton" name="cogc">
        <UTextarea v-model="state.description" />
      </UFormGroup>
      <!-- <UFormGroup label="CoGC Parameter" name="cogc_params">
        <template #hint>
          <UButton
            icon="i-heroicons-plus-16-solid"
            color="gray"
            @click="
              state.cogc_params.push({
                attribute: undefined,
                value: undefined,
              })
            "
          />
        </template>
      </UFormGroup> -->
      <!-- <div
        class="grid grid-cols-12 gap-1 mb-3 mt-1"
        v-for="i in state.cogc_params.length"
      >
        <UFormGroup
          :name="'cogc_params.' + (i - 1).toString() + '.attribute'"
          class="col-span-6"
        >
          <UInput v-model="state.cogc_params[i - 1].attribute" />
        </UFormGroup>
        <UFormGroup
          :name="'cogc_params.' + (i - 1).toString() + '.value'"
          class="col-span-5"
        >
          <UInput v-model="state.cogc_params[i - 1].value" />
        </UFormGroup>

        <UFormGroup>
          <UButton
            icon="i-heroicons-minus-16-solid"
            color="red"
            @click="state.cogc_params.splice(i - 1, 1)"
            :disabled="state.cogc_params.length === 1"
          />
        </UFormGroup>
      </div> -->
      <div class="grid grid-cols-2 gap-1">
        <UButton label="Simpan" type="submit" :disabled="diabledSumbit" />
        <UButton label="Batal" color="red" @click="emits('close')" />
      </div>
    </UForm>
  </UDashboardSlideover>
</template>
