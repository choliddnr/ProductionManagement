<script setup lang="ts">
import { ModalConfirm, UButton } from "#components";
import { type ItemCategory, ItemCategorySchema } from "~/schemas/item.schema";
import { type Base } from "~/schemas/types.d";
import colors from "#tailwind-config/theme/colors";

const props = defineProps<{
  id?: string;
}>();
let category: ItemCategory & Base;

const isEdit: boolean = props.id ? true : false;
const state = reactive({
  title: undefined,
  description: undefined,
  color: undefined,
});
if (isEdit) {
  await useFetch<ItemCategory & Base>("/api/item_categories", {
    method: "GET",
    query: {
      id: props.id,
    },
    onResponse: ({ response }) => {
      category = response._data;
    },
  });
  state.title = category.title;
  state.description = category.description;
  state.color = category.color;
}
const emits = defineEmits(["close"]);
const modal = useModal();
const toast = useToast();
const { fetch: updateCategories } = useItemCategoriesStore();
const { $editData, $addData } = useNuxtApp();

const submit = () => {
  const body = <ItemCategory & { updated?: Date }>{
    title: state.title,
    description: state.description,
    color: state.color,
  };
  if (isEdit) body.updated = category.updated;
  console.log("body", body);

  modal.open(ModalConfirm, {
    message: "Apakah anda yakin semua field terisi dengan benar?",
    label: {
      continue: "Iya, Simpan",
      cancel: "Tinjau Kembali",
    },

    onContinue: async () => {
      await $fetch("/api/item_categories", {
        method: isEdit ? "PATCH" : "POST",
        query: isEdit ? { id: category.id } : {},
        body,
        onResponse: async ({ response }) => {
          console.log("cat res log", response._data);

          isEdit
            ? await $editData("item_categories", response._data)
            : await $addData("item_categories", response._data);
          await updateCategories();
          modal.close();
          emits("close");
          toast.add({
            title: "Success",
            description: "Stock berhasil diperbarui!",
          });
        },
      });
    },
    onCancel: () => {
      modal.close();
    },
  });
};

const appConfig = useAppConfig();
const colorMode = useColorMode();

// Computed

const primaryColors = computed(() =>
  appConfig.ui.colors
    .filter((color) => color !== "primary")
    .map((color) => ({
      value: color,
      text: color,
      hex: colors[color][colorMode.value === "dark" ? 400 : 500],
    }))
);
const primary = computed({
  get() {
    return primaryColors.value.find(
      (option) => option.value === appConfig.ui.primary
    );
  },
  set(option) {
    appConfig.ui.primary = option.value;

    window.localStorage.setItem("nuxt-ui-primary", appConfig.ui.primary);
  },
});
</script>

<template>
  <USlideover prevent-close>
    <UCard
      :ui="{
        ring: '',
        body: {
          base: 'flex-1',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        },
      }"
      class="flex flex-col flex-1"
    >
      <template #header>
        <div class="justify-between categorys-center flex">
          <h3
            class="text-base font-semibold leading-6 dark:text-white text-gray-900"
          >
            Perbarui Stock
          </h3>
        </div>
      </template>
      <UForm :schema="ItemCategorySchema" :state="state" class="space-y-4">
        <UFormGroup label="Title" name="newStock">
          <UInput v-model="state.title" />
        </UFormGroup>
        <UFormGroup label="Description" name="description">
          <UTextarea v-model="state.description" />
        </UFormGroup>
        <UFormGroup label="Color" name="newStock">
          <!-- <UInput v-model="state.color" /> -->

          <UPopover>
            <UButton
              :color="state.color"
              label="Pilih Warna"
              class="w-full text-center items-center justify-center"
            />

            <template #panel>
              <div class="p-2">
                <div class="grid grid-cols-5 gap-px">
                  <ColorPickerPill
                    v-for="color in primaryColors"
                    :key="color.value"
                    :color="color"
                    :selected="primary"
                    @select="state.color = color.value"
                  />
                </div>
              </div>
            </template>
          </UPopover>
        </UFormGroup>
        <UButton @click="submit" class="w-min-20 justify-center mr-3"
          >Simpan</UButton
        >
        <UButton color="red" @click="emits('close')">Batal</UButton>
      </UForm>
    </UCard>
  </USlideover>
</template>
