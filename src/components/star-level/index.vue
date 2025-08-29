<template>
  <div class="star-rating">
    <el-icon v-for="(star, index) in stars" :key="index" :size="size" :color="index < modelValue ? activeColor : inactiveColor" @click="handleClick(index + 1)">
      <StarFilled />
    </el-icon>
  </div>
</template>

<script lang="ts" setup>
import { StarFilled } from "@element-plus/icons-vue";
import { withDefaults } from "vue";

interface Props {
  modelValue: number; // 当前选中星数 (v-model)
  max?: number; // 最大星数 (默认5)
  size?: number; // 图标大小
  activeColor?: string; // 选中颜色
  inactiveColor?: string; // 未选中颜色
  disabled?: boolean; // 是否禁用交互
}

const props = withDefaults(defineProps<Props>(), {
  max: 5,
  size: 20,
  activeColor: "#ffc107",
  inactiveColor: "#e0e0e0",
  disabled: false
});

const emit = defineEmits(["update:modelValue", "change"]);

// 生成星数数组
const stars = Array.from({ length: props.max }, (_, i) => i + 1);

const handleClick = (value: number) => {
  if (props.disabled) return;

  emit("update:modelValue", value);
  emit("change", value);
};
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
}
.star-rating .el-icon {
  cursor: pointer;
  margin-right: 4px;
}
.star-rating .el-icon:last-child {
  margin-right: 0;
}
</style>