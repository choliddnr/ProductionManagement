<script lang="ts" setup>
import {
  IngredientsSchema,
  type Ingredients,
  type Item,
} from "~~/schemas/item.schema";
import Confirm from "./Confirm.vue";

/**
 * Define Variable
 */
const props = defineProps<{
  ingId: string | undefined;
  otherIng: string[];
  productId: string;
}>();
const { ingredients } = storeToRefs(useIngredientsStore());
const emits = defineEmits(["close"]);
const modal = useModal();
const message = "Apakah anda yakin data yang anda masukan sudah benar?";
const continueLabel = "Iya, Simpan";
const cancelLabel = "Tinjau kembali";
const { itemsMap, items } = storeToRefs(useItemsStore());
const state = reactive<Partial<Ingredients & { updated: Date }>>({
  id: undefined,
  item: undefined,
  qty: undefined,
  substitutes: [],
  updated: undefined,
});
const options = computed(() => {
  return items.value.filter(
    (e) =>
      ![
        ...props.otherIng.filter((i) => i != state.item),
        props.ingId,
        props.productId,
      ].includes(e.id)
  );
});

if (props.ingId) {
  const { refresh } = await useFetch<Ingredients>(
    "/api/items/ingredients/one",
    {
      method: "get",
      params: { id: props.ingId },
      onResponse: ({ response }) => {
        console.log("response._data", response._data);
        state.item = (response._data as Ingredients).item;
        state.qty = (response._data as Ingredients).qty;
        state.substitutes = (response._data as Ingredients).substitutes;
        state.updated = response._data.updated;
      },
    }
  );
} else {
  state.item = undefined;
  state.qty = undefined;
  state.substitutes = [];
  state.updated = undefined;
}

/**
 * Func
 */
const onSubmit = async () => {
  modal.open(Confirm, {
    message: message,
    label: { continue: continueLabel, cancel: cancelLabel },
    onContinue: async () => {
      await $fetch("/api/items/ingredients", {
        method: props.ingId ? "PUT" : "POST",
        body: {
          product: props.productId,
          item: state.item,
          qty: state.qty,
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
                    product: response._data.product,
                    item: response._data.item,
                    qty: response._data.qty,
                    substitutes: response._data.substitutes,
                    info: i.info,
                  }
                : i;
            });
          } else {
            ingredients.value.push({
              id: response._data.id,
              product: response._data.product,
              item: response._data.item,
              qty: response._data.qty,
              substitutes: response._data.substitutes,
              info: itemsMap.value.get(response._data.item),
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
  <UForm :schema="IngredientsSchema" :state="state" class="space-y-4">
    <!-- v-if="showForm" -->
    <div class="grid grid-cols-3 gap-2">
      <UFormGroup label="Bahan" name="ingredient" class="col-span-2">
        <USelectMenu
          :disabled="ingId != undefined"
          v-model="state.item"
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
      <UFormGroup label="Takaran" name="qty">
        <UInput
          v-model="state.qty"
          type="number"
          class="mb-1"
          :placeholder="
            state.item ? ' % setiap ' + itemsMap.get(state.item).unit : ' '
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
              @click="state.substitutes.splice(i, 1)"
            />
          </UBadge>
        </template>
        <USelectMenu
          v-model="state.substitutes"
          :options="options.filter((e) => e.id != state.item)"
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
      <UButton @click="onSubmit" type="submit" class="justify-center"
        >Submit</UButton
      >
      <UButton @click="emits('close')" class="justify-center" color="red"
        >Cancel</UButton
      >
    </div>
    <UDivider />
  </UForm>
</template>
