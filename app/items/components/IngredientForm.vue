<script lang="ts" setup>
import type { FormSubmitEvent } from "#ui/types";
import { Confirm } from "#components";
import { type output as zodOutput } from "zod";
import {
  IngredientsSchema,
  type Ingredients,
  type Item,
} from "~~/schemas/item.schema";

const props = defineProps<{
  id?: string;
}>();

const emits = defineEmits<{
  close: [];
}>();
const item = ref<Item>();
// const ing = ref<Ingredients[]>();
await useFetch<Item>("/api/items", {
  method: "GET",
  query: {
    id: props.id,
  },
  onResponse: ({ response }) => {
    item.value = response._data;
    // ing.value = response._data.ingredients;
  },
});

const message = "Apakah anda yakin data yang anda masukan sudah benar?";
const continueLabel = "Iya, Simpan";
const cancelLabel = "Tinjau kembali";
const isEdit = ref<boolean>(false);
const modal = useModal();
const toast = useToast();
const { $addData, $editData } = useNuxtApp();
const { itemsMap, items } = storeToRefs(useItemsStore());
const { fetch: updateItems } = useItemsStore();

type FormSchema = zodOutput<typeof IngredientsSchema>;

const state = reactive<Partial<Ingredients>>({
  ingredient: undefined,
  measure: undefined,
  subtitute: [],
});

// const ingredients = reactive<Partial<(Ingredients & { item: Item })[]>>([]);
// item.value.ingredients.forEach((ingredient, index) => {
//   const data = {
//     ingredient: ingredient.ingredient,
//     measure: ingredient.measure,
//     subtitute: ingredient.subtitute,
//     item: itemsMap.value.get(ingredient.ingredient),
//   };
//   ingredients.push(data);
// });

const ingredients = computed<Partial<(Ingredients & { item: Item })[]>>(() => {
  let x: (Ingredients & { item: Item })[] = [];
  item.value.ingredients.forEach((ingredient, index) => {
    const data = {
      ingredient: ingredient.ingredient,
      measure: ingredient.measure,
      subtitute: ingredient.subtitute,
      item: itemsMap.value.get(ingredient.ingredient),
    };
    x.push(data);
  });
  return x;
});

const update = async () => {
  await $fetch("/api/items", {
    method: "PATCH",
    params: { id: item.value.id },
    body: {
      ingredients: item.value.ingredients,
      updated: item.value.updated,
    },
    onResponse: async ({ response }) => {
      if (response.status === 404) {
        toast.add({
          icon: "i-heroicons-exclamation-triangle",
          color: "red",
          title: "Gagal",
          description: response.statusText,
        });
      } else {
        try {
          isEdit
            ? await $editData("items", response._data)
            : await $addData("items", response._data);
          await updateItems();
        } catch (error) {
          toast.add({
            title: "Peringatan",
            description:
              "Item baru berhasil ditambahkan tapi gagal memperbaharui local database anda. Local database anda mungkin tidak uptodate. Silahkan di sinkronisasi secara manual.",
          });
        }
      }
    },
  });
};

const onSubmit = async (event: FormSubmitEvent<FormSchema>) => {
  item.value.ingredients.push(state);
  modal.open(Confirm, {
    message: message,
    label: { continue: continueLabel, cancel: cancelLabel },
    onContinue: async () => {
      modal.close();
      await update();
      emits("close");
      toast.add({
        title: "Success",
        description: isEdit
          ? "Bahan berhasil diperbarui"
          : "Bahan baru berhasil ditambahkan",
      });
    },
    onCancel: () => modal.close(),
  });
};
const showForm = ref<boolean>(false);
watch(state, () => {
  console.log("satte", state);
});
// watch(ingredients, async () => {
//   console.log("ingredients", ingredients, item.value.ingredients);
//   await update();
// });
</script>

<template>
  <USlideover prevent-close>
    <UCard
      class="flex flex-col flex-1"
      :ui="{
        body: { base: 'flex-1', body: { padding: 'p-0 mt-20' } },
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3
            class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
          >
            Komposisi:
          </h3>
          <div>
            <UTooltip text="Tambah Bahan" :popper="{ arrow: true }"
              ><UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-plus-20-solid"
                class="-my-1"
                @click="showForm = !showForm"
              />
            </UTooltip>

            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="emits('close')"
            />
          </div>
        </div>
      </template>
      <Transition>
        <UForm
          :schema="IngredientsSchema"
          :state="state"
          class="space-y-4"
          v-if="showForm"
          @submit="onSubmit"
        >
          <div class="grid grid-cols-3 gap-2">
            <UFormGroup label="Bahan" name="ingredient" class="col-span-2">
              <USelectMenu
                v-model="state.ingredient"
                :options="items"
                searchable
                searchable-placeholder="type item name"
                option-attribute="title"
                value-attribute="id"
                :search-attribute="['title']"
                placeholder="Pilih bahan"
              >
              </USelectMenu>
            </UFormGroup>
            <UFormGroup label="Takaran" name="measure">
              <UInput
                v-model="state.measure"
                type="number"
                class="mb-1"
                :placeholder="
                  state.ingredient
                    ? ' % setiap ' + itemsMap.get(state.ingredient).unit
                    : ' '
                "
              />
            </UFormGroup>
            <UFormGroup
              label="Opsi pengganti"
              name="subtitute"
              class="col-span-3"
            >
              <template #description>
                <UBadge
                  v-for="(sub, i) in state.subtitute"
                  :ui="{ rounded: 'rounded-full' }"
                  class="mr-1 mb-1"
                  variant="soft"
                  size="xs"
                >
                  {{ itemsMap.get(sub).title }}
                  <UButton
                    size="2xs"
                    icon="i-heroicons-x-mark-20-solid"
                    variant="ghost"
                    :ui="{
                      variant: {
                        ghost:
                          'bg-transparent dark:bg-transparent hover:bg-transparent dark:hover:bg-transparent',
                      },
                    }"
                    @click="state.subtitute.splice(i, 1)"
                  />
                </UBadge>
              </template>
              <USelectMenu
                v-model="state.subtitute"
                :options="items"
                searchable
                multiple
                searchable-placeholder="Ketik item name"
                placeholder="Pilih item-item yang bisa jadi pnegganti"
                option-attribute="title"
                value-attribute="id"
                :search-attribute="['title']"
              >
                <template #label>
                  <span v-if="state.subtitute.length" class="truncate"
                    >{{ state.subtitute.length }} item dipilih</span
                  >
                  <span v-else class="text-gray-500">Pilih item</span>
                </template>
              </USelectMenu>
            </UFormGroup>
          </div>
          <div class="grid grid-cols-2 gap-2 place-items-stretch">
            <UButton type="submit" class="justify-center">Submit</UButton>
            <UButton @click="onSubmit" class="justify-center" color="red"
              >Cancel</UButton
            >
          </div>
          <UDivider />
        </UForm>
      </Transition>

      <div v-for="(s, i) in ingredients">
        <UDashboardSection
          :class="[!showForm && i == 0 ? 'mt-0' : 'mt-4']"
          :ui="{
            container: 'grid grid-cols-12 gap-0',
            inner: 'col-span-10',
            links: 'col-span-2 grid grid-cols-2 gap-0 justify-end',
          }"
        >
          <template #title>
            <span class="text-gray-900 dark:text-white font-semibold"
              >{{ s.item.title }}
              <UBadge color="gray" :ui="{ rounded: 'rounded-full' }"
                >{{ s.measure.toString() }} {{ s.item.unit }}</UBadge
              >
            </span>
          </template>
          <template #description>
            <UBadge
              v-for="(sub, idx) in s.subtitute"
              class="mr-1 mb-1.5"
              :ui="{ rounded: 'rounded-full' }"
              >{{ itemsMap.get(sub).title }}</UBadge
            >
          </template>
          <template #links>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-pencil"
              class="-my-1 w-8 h-8 justify-center"
              size="2xs"
            />
            <UButton
              color="red"
              variant="ghost"
              icon="i-heroicons-trash-20-solid"
              class="-my-1 w-8 h-8 justify-center"
              size="2xs"
              @click="
                () => {
                  modal.open(Confirm, {
                    message: 'Apakah anda yakin?',
                    label: {
                      continue: 'Iya',
                      cancel: 'Tinjau kembali',
                    },
                    onContinue: () => {
                      item.ingredients.splice(i, 1);
                      modal.close();
                    },
                    onCancel: () => {
                      modal.close();
                    },
                  });
                }
              "
            /> </template
        ></UDashboardSection>
        <UDivider />
      </div>
    </UCard>
  </USlideover>
</template>
<style>
/* we will explain what these classes do next! */
.v-enter-active,
.v-leave-active {
  transition: all 0.2s ease-out;
  height: 128px;
}

.v-enter-from,
.v-leave-to {
  transition: all 0.2s ease-out;
  height: 0;
  opacity: 0;
  overflow: hidden;
}
</style>
