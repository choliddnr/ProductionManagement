<script lang="ts" setup>
import {
  IngredientsSchema,
  type Ingredients,
  type Item,
} from "~/schemas/item.schema";
import type { ItemInfo } from "../types";
import { LazyModalConfirm } from "#components";

/**
 * Define Variable
 */
const props = defineProps<{
  ingId: string | undefined;
  otherIng: string[];
  selfProducedProduct: string;
}>();
const { ingredients } = storeToRefs(useIngredientsStore());
const emits = defineEmits(["close"]);
const modal = useModal();
const message = "Apakah anda yakin data yang anda masukan sudah benar?";
const continueLabel = "Iya, Simpan";
const cancelLabel = "Tinjau kembali";
// const { itemsMap, items } = storeToRefs(useItemsStore());

const state = reactive<Ingredients & { updated: Date }>({
  id: undefined,
  ingredient: undefined,
  self_produced_item: props.selfProducedProduct,
  quantity: undefined,
  substitutes: [],
  updated: undefined,
});
console.log("self_produced_item", state.self_produced_item);

const { data: itemInfo } = useFetch<ItemInfo[]>("/api/production/item_info");
const options = computed(() => {
  if (!itemInfo.value) return [];
  return itemInfo.value.filter(
    (e) =>
      ![
        ...props.otherIng.filter((i) => i != state.ingredient),
        props.ingId,
        props.selfProducedProduct,
      ].includes(e.id)
  );
});

if (props.ingId) {
  const { refresh } = await useFetch<Ingredients>(
    "/api/production/ingredients/one",
    {
      method: "get",
      params: { id: props.ingId },
      onResponse: ({ response }) => {
        console.log("response._data", response._data);
        state.ingredient = (response._data as Ingredients).ingredient;
        state.quantity = (response._data as Ingredients).quantity;
        state.substitutes = (response._data as Ingredients).substitutes;
        state.updated = response._data.updated;
      },
    }
  );
} else {
  state.ingredient = undefined;
  state.quantity = undefined;
  state.substitutes = [];
  state.updated = undefined;
}

/**
 * Func
 */
const onSubmit = async () => {
  modal.open(LazyModalConfirm, {
    message: message,
    label: { continue: continueLabel, cancel: cancelLabel },
    onContinue: async () => {
      await $fetch("/api/production/ingredients", {
        method: props.ingId ? "PUT" : "POST",
        body: {
          self_produced_item: props.selfProducedProduct,
          ingredient: state.ingredient,
          quantity: state.quantity,
          substitutes: state.substitutes,
          updated: state.updated,
        },
        params: {
          id: props.ingId,
        },
        onResponse: ({ response }) => {
          if (props.ingId) {
            ingredients.value = ingredients.value.map((i) => {
              return i.id == props.ingId
                ? {
                    id: response._data.id,
                    self_produced_item: props.selfProducedProduct,
                    ingredient: response._data.item,
                    quantity: response._data.quantity,
                    substitutes: response._data.substitutes,
                    info: i.info,
                  }
                : i;
            });
          } else {
            ingredients.value.push({
              id: response._data.id,
              self_produced_item: props.selfProducedProduct,
              ingredient: response._data.ingredient,
              quantity: response._data.quantity,
              substitutes: response._data.substitutes,
              info: itemInfo.value.find(
                (i) => i.id === response._data.ingredient
              ),
            });
          }
        },
      });
      modal.close();
      emits("close");
    },
    onCancel: () => modal.close(),
  });
};
const editIngredient = async () => {};
</script>

<template>
  <UForm
    :schema="IngredientsSchema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <!-- v-if="showForm" -->
    <div class="grid grid-cols-3 gap-2">
      <UFormGroup label="Bahan" name="ingredient" class="col-span-2">
        <USelectMenu
          :disabled="ingId != undefined"
          v-model="state.ingredient"
          :options="
            options
            // ingId
            //   ? options
            //   : options.filter((e) => !ingredients.find((i) => i.item == e.id))
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
      <UFormGroup label="Takaran" name="quantity">
        <UInput
          v-model="state.quantity"
          type="number"
          class="mb-1"
          :placeholder="
            state.ingredient
              ? ' % setiap ' +
                itemInfo.find((i) => i.id === state.ingredient).uom
              : ' '
          "
        />
      </UFormGroup>
      <UFormGroup label="Opsi pengganti" name="substitutes" class="col-span-3">
        <template #description>
          <UBadge
            v-for="(sub, i) in state.substitutes"
            :ui="{ rounded: 'rounded-full' }"
            class="mr-1 mb-1"
            variant="soft"
            size="xs"
          >
            {{ itemInfo.find((i) => i.id === sub).title }}
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
              @click="state.substitutes.splice(i, 1)"
            />
          </UBadge>
        </template>
        <USelectMenu
          v-model="state.substitutes"
          :options="options.filter((e) => e.id != state.ingredient)"
          searchable
          searchable-placeholder="Ketik item name"
          multiple
          placeholder="Pilih item-item yang bisa jadi pnegganti"
          option-attribute="title"
          value-attribute="id"
          :search-attribute="['title']"
        >
          <template #label>
            <span v-if="state.substitutes.length" class="truncate"
              >{{ state.substitutes.length }} item dipilih</span
            >
            <span v-else class="text-gray-500">Pilih item</span>
          </template>
        </USelectMenu>
      </UFormGroup>
    </div>
    <div class="grid grid-cols-2 gap-2 place-items-stretch">
      <UButton type="submit" class="justify-center">Submit</UButton>
      <UButton @click="emits('close')" class="justify-center" color="red"
        >Cancel</UButton
      >
    </div>
    <UDivider />
  </UForm>
</template>
