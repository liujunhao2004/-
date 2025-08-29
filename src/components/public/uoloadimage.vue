<template>
  <el-upload :key="uploadKey" :disabled="disabled" :action="url" :file-list="displayFileList" :multiple="multiple" list-type="picture-card" :before-upload="beforeUploadHandle" :on-success="handleSuccess" :on-preview="handlePreview" :on-remove="handleRemove" accept="image/*">
    <el-icon><Plus /></el-icon>
  </el-upload>

  <el-dialog v-model="dialogVisible" center>
    <div style="text-align: center">
      <el-image style="margin: 0 auto" :src="dialogImageUrl" />
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { getToken } from "@/utils/cache";
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import app from "@/constants/app";

const props = defineProps({
  modelValue: {
    type: [Array, String] as () => string[] | string,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  multiple: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:modelValue"]);

const url = ref("");
const dialogVisible = ref(false);
const dialogImageUrl = ref("");
const uploadKey = ref(0);

// 将v-model值转换为el-upload需要的格式
const displayFileList = computed(() => {
  if (!props.modelValue) return [];

  // 处理字符串情况
  if (typeof props.modelValue === "string") {
    return props.modelValue
      ? [
          {
            uid: props.modelValue,
            name: props.modelValue.substring(props.modelValue.lastIndexOf("/") + 1),
            url: props.modelValue,
            status: "success"
          }
        ]
      : [];
  }

  // 处理数组情况
  return props.modelValue.map((url) => ({
    uid: url,
    name: url.substring(url.lastIndexOf("/") + 1),
    url: url,
    status: "success"
  }));
});

// 初始化上传配置
const init = () => {
  url.value = `${app.api}/sys/oss/upload?token=${getToken()}`;
};

// 文件上传前的校验
const beforeUploadHandle = (file: File) => {
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const isImage = validTypes.includes(file.type);
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error("只能上传图片格式文件（JPEG/PNG/GIF/WEBP）!");
    return false;
  }
  if (!isLt5M) {
    ElMessage.error("图片大小不能超过5MB!");
    return false;
  }
  return true;
};

// 上传成功处理
const handleSuccess = (response: any, file: File) => {
  if (response.code !== 0) {
    ElMessage.error(response.msg);
    return;
  }

  const newUrl = response.data.url || response.data.src;
  if (!newUrl) {
    ElMessage.error("获取图片URL失败");
    return;
  }

  if (props.multiple) {
    // 多张模式 - 追加新图片
    const current = Array.isArray(props.modelValue) ? props.modelValue : [];
    emit("update:modelValue", [...current, newUrl]);
  } else {
    // 单张模式 - 覆盖旧图片
    if (Array.isArray(props.modelValue)) {
      // 如果父组件传的是数组，但multiple=false，也返回数组（但只包含最新的一张）
      emit("update:modelValue", [newUrl]);
    } else {
      // 如果父组件传的是字符串，返回字符串
      emit("update:modelValue", newUrl);
    }
  }

  ElMessage.success("上传成功");
  uploadKey.value++; // 刷新上传组件
};

// 图片预览
const handlePreview = (file: { url: string }) => {
  dialogImageUrl.value = file.url;
  dialogVisible.value = true;
};

// 删除图片
const handleRemove = (file: { url: string }) => {
  if (Array.isArray(props.modelValue)) {
    // 如果父组件传的是数组
    if (props.multiple) {
      // 多张模式 - 过滤掉被删除的图片
      emit(
        "update:modelValue",
        props.modelValue.filter((url) => url !== file.url)
      );
    } else {
      // 单张模式 - 返回空数组
      emit("update:modelValue", []);
    }
  } else {
    // 如果父组件传的是字符串 - 返回空字符串
    emit("update:modelValue", "");
  }
  ElMessage.success("删除成功");
};

// 初始化
onMounted(() => {
  init();
});
</script>