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
await useFetch<Item>("/api/items", {
  method: "GET",
  query: {
    id: props.id,
  },
  onResponse: ({ response }) => {
    item.value = response._data;
  },
});

const message = "Apakah anda yakin data yang anda masukan sudah benar?";
const continueLabel = "Iya, Simpan";
const cancelLabel = "Tinjau kembali";
const indexToEdit = ref<number>(undefined);
const showForm = ref<boolean>(false);
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

const options = computed(() => {
  return items.value.filter(
    (e) => e.id != item.value.id && !state.subtitute.includes(e.id)
  );
});

const update = async () => {
  if (showForm.value) showForm.value = false;
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
          indexToEdit
            ? await $editData("items", response._data)
            : await $addData("items", response._data);
          await updateItems();
          toast.add({
            title: "Success",
            description: indexToEdit
              ? "Bahan berhasil diperbarui"
              : "Bahan baru berhasil ditambahkan",
          });
          item.value = response._data;

          indexToEdit.value = undefined;
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

const editIngredient = async (index: number) => {
  if (!showForm.value) showForm.value = true;
  indexToEdit.value = index;
  state.ingredient = ingredients.value[indexToEdit.value].ingredient;
  state.measure = ingredients.value[indexToEdit.value].measure;
  state.subtitute = ingredients.value[indexToEdit.value].subtitute;
  // item.value.ingredients[index] = state;
};

const onSubmit = async (event: FormSubmitEvent<FormSchema>) => {
  modal.open(Confirm, {
    message: message,
    label: { continue: continueLabel, cancel: cancelLabel },
    onContinue: async () => {
      if (indexToEdit.value) {
        item.value.ingredients[indexToEdit.value] = state;
      } else {
        item.value.ingredients.push(state);
      }
      await update();
      modal.close();
    },
    onCancel: () => modal.close(),
  });
};
watch(state, () => {
  console.log("state", state, item.value.ingredients, ingredients.value);
});
</script>

<template>
  <UDashboardSlideover
    prevent-close
    :ui="{ header: { base: 'grid grid-cols-12' } }"
  >
    <template #header>
      <h3
        class="text-base font-semibold leading-6 text-gray-900 dark:text-white col-span-10"
      >
        Komposisi: {{ item.title }}
      </h3>
      <div class="col-span-2">
        <UTooltip text="Tambah Bahan" :popper="{ arrow: true }"
          ><UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-plus-20-solid"
            class="-my-1"
            @click="
              () => {
                indexToEdit = undefined;
                state.ingredient = undefined;
                state.measure = undefined;
                state.subtitute = [];
                if (!showForm) showForm = true;
              }
            "
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
    </template>
    <!-- Form -->
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
              :disabled="indexToEdit != undefined"
              v-model="state.ingredient"
              :options="
                indexToEdit
                  ? options
                  : options.filter(
                      (e) => !item.ingredients.find((i) => i.ingredient == e.id)
                    )
              "
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
              :options="options.filter((e) => e.id != state.ingredient)"
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
          <UButton @click="showForm = false" class="justify-center" color="red"
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
            @click="editIngredient(i)"
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
                  onContinue: async () => {
                    item.ingredients.splice(i, 1);
                    await update();
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
  </UDashboardSlideover>
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
