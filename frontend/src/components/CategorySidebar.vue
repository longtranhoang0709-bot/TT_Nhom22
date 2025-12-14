<script setup>
defineProps({
  currentCategory: {
    type: Number,
    default: null
  }
});

defineEmits(['select-category']);
</script>

<template>
  <BCard no-body class="shadow-sm">
    <template #header>
      <h5 class="mb-0">Danh mục</h5>
    </template>
    
    <BListGroup flush>
      <BListGroupItem 
        button 
        :active="currentCategory === null"
        @click="$emit('select-category', null)"
      >
        Tất cả sản phẩm
      </BListGroupItem>

      <BListGroupItem 
        button 
        :active="currentCategory === 1"
        @click="$emit('select-category', 1)"
      >
         Cà phê
      </BListGroupItem>

      <BListGroupItem 
        button 
        :active="currentCategory === 2"
        @click="$emit('select-category', 2)"
      >
         Bánh ngọt
      </BListGroupItem>
    </BListGroup>
  </BCard>
</template>