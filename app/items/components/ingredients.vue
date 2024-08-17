<script setup lang="ts">
import ModalConfirm from "../../base/components/ModalModalConfirm.vue";

/**
 * Define Variable
 */

const props = defineProps<{
  selfProducedItemId: string;
}>();
const emits = defineEmits(["close"]);
const { itemsMap } = storeToRefs(useItemsStore());
const { ingredients, selfProducedItem } = storeToRefs(useIngredientsStore());
const { fetch: fetchIng } = useIngredientsStore();
const showForm = ref<boolean>(false);
const ingIdToEdit = ref<string>();
const modal = useModal();

/**
 * Func
 */
const openForm = () => {
  if (showForm.value) {
    showForm.value = false;
    setTimeout(() => {
      showForm.value = true;
    }, 500);
  } else {
    showForm.value = true;
  }
};

const editIngredient = async (ingId: string) => {
  ingIdToEdit.value = ingId;
  openForm();
};

const onDelete = (index: number, ingId: string) => {
  modal.open(ModalConfirm, {
    message: "Apakah anda yakin?",
    label: {
      continue: "Iya",
      cancel: "Batal",
    },
    onContinue: async () => {
      await $fetch("/api/items/ingredients", {
        method: "DELETE",
        params: { id: ingId },
        onResponse: () => {
          ingredients.value.splice(index, 1);
        },
      });
      modal.close();
    },
    onCancel: () => {
      modal.close();
    },
  });
};

onBeforeMount(async () => {
  selfProducedItem.value = props.selfProducedItemId;
  await fetchIng();
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
        Komposisi: {{ itemsMap.get(selfProducedItemId).title }}
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
                ingIdToEdit = undefined;
                openForm();
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
    <Transition>
      <IngredientForm
        :ing-id="ingIdToEdit"
        :self-produced-item-id="selfProducedItemId"
        :other-ing="ingredients.map((i) => i.ingredient)"
        v-if="showForm"
        @close="showForm = false"
      />
    </Transition>

    <div v-for="(ing, i) in ingredients">
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
            >{{ ing.info.title }}
            <UBadge color="gray" :ui="{ rounded: 'rounded-full' }"
              >{{ ing.quantity.toString() }} {{ ing.info.uom }}</UBadge
            >
          </span>
        </template>
        <template #description>
          <UBadge
            v-for="(sub, idx) in ing.substitutes"
            class="mr-1 mb-1.5"
            :ui="{ rounded: 'rounded-full' }"
          >
            {{ itemsMap.get(sub).title }}
          </UBadge>
        </template>
        <template #links>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-pencil"
            class="-my-1 w-8 h-8 justify-center"
            size="2xs"
            @click="editIngredient(ing.id)"
          />
          <UButton
            color="red"
            variant="ghost"
            icon="i-heroicons-trash-20-solid"
            class="-my-1 w-8 h-8 justify-center"
            size="2xs"
            @click="onDelete(i, ing.id)"
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
