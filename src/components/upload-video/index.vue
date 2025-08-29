<template>
  <div class="video-uploader">
    <el-upload
      v-if="!disabled"
      :key="uploadKey"
      :action="url"
      :file-list="fileList"
      :before-upload="beforeUploadHandle"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      accept="video/mp4,video/webm,video/ogg"
      class="upload-demo"
      :show-file-list="false"
      :auto-upload="true"
    >
      <el-button type="primary" :loading="uploading"> 上传视频 </el-button>
      <template #tip>
        <div class="el-upload__tip">只能上传MP4/WebM/OGG格式视频，且不超过100MB</div>
      </template>
    </el-upload>

    <!-- 上传进度 -->
    <div v-if="uploading" class="upload-progress">
      <el-progress :percentage="uploadPercent" :status="uploadStatus" :stroke-width="16" :text-inside="true" />
      <div class="progress-info">
        <span>{{ uploadPercent }}%</span>
        <span>{{ formatFileSize(uploadedSize) }} / {{ formatFileSize(totalSize) }}</span>
      </div>
    </div>

    <!-- 视频预览 -->
    <div v-if="currentVideo && currentVideo.url" class="video-preview">
      <video controls :src="currentVideo.url" class="video-player" @loadedmetadata="handleLoadedMetadata" preload="auto"></video>
      <el-button v-if="!disabled" type="danger" size="small" @click="handleRemove" class="delete-btn" :disabled="uploading"> 删除视频 </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { getToken } from "@/utils/cache";
import { ElMessage } from "element-plus";
import app from "@/constants/app";

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:modelValue"]);

const url = ref("");
const uploadKey = ref(0);
const duration = ref(0);
const fileList = ref<any[]>([]);
const currentVideo = ref<any>(null);
const uploading = ref(false);
const uploadPercent = ref(0);
const uploadedSize = ref(0);
const totalSize = ref(0);
const uploadStatus = ref<"" | "success" | "exception">("");
const tempCurrentVideo = ref<any>(null); // 临时存储旧视频信息

// 初始化上传配置
const init = () => {
  url.value = `${app.api}/sys/oss/upload?token=${getToken()}`;

  if (props.modelValue) {
    fileList.value = [
      {
        name: props.modelValue.split("/").pop(),
        url: props.modelValue,
        status: "success"
      }
    ];
    currentVideo.value = fileList.value[0];
  }
};

// 文件上传前的校验
const beforeUploadHandle = (file: File) => {
  if (props.disabled) return false;

  uploading.value = true;
  uploadPercent.value = 0;
  uploadedSize.value = 0;
  totalSize.value = file.size;
  uploadStatus.value = "";

  const validTypes = ["video/mp4", "video/webm", "video/ogg"];
  const isVideo = validTypes.includes(file.type);
  const isLt100M = file.size / 1024 / 1024 < 100;

  if (!isVideo) {
    ElMessage.error("只能上传视频格式文件（MP4/WebM/OGG）!");
    resetUploadStatus();
    return false;
  }
  if (!isLt100M) {
    ElMessage.error("视频大小不能超过100MB!");
    resetUploadStatus();
    return false;
  }

  // 临时保存当前视频信息
  tempCurrentVideo.value = currentVideo.value;

  // 设置新上传的视频信息
  currentVideo.value = {
    name: file.name,
    size: file.size,
    file: file,
    status: "uploading"
  };

  return true;
};

// 上传进度处理
const handleProgress = (event: ProgressEvent) => {
  if (event.lengthComputable) {
    uploadPercent.value = Math.round((event.loaded / event.total) * 100);
    uploadedSize.value = event.loaded;
    totalSize.value = event.total;
  }
};

// 上传成功处理
const handleSuccess = (response: any, file: File) => {
  uploadStatus.value = "success";

  if (response.code !== 0) {
    ElMessage.error(response.msg);
    // handleUploadFailed();
    return;
  }

  const videoUrl = response.data.url || response.data.src;
  if (!videoUrl) {
    ElMessage.error("获取视频URL失败");
    // handleUploadFailed();
    return;
  }

  emit("update:modelValue", videoUrl);
  ElMessage.success("上传成功");

  fileList.value = [
    {
      //   uid: file.uid,
      name: file.name,
      url: videoUrl,
      status: "success",
      size: file.size
    }
  ];

  currentVideo.value = {
    ...currentVideo.value,
    url: videoUrl,
    status: "success"
  };

  // 清除临时存储
  tempCurrentVideo.value = null;

  setTimeout(() => {
    resetUploadStatus();
  }, 1000);
};

// 上传失败处理
const handleError = (error: Error) => {
  uploadStatus.value = "exception";
  ElMessage.error("上传失败: " + error.message);

  // 恢复之前的视频
  if (tempCurrentVideo.value) {
    currentVideo.value = tempCurrentVideo.value;
    fileList.value = [tempCurrentVideo.value];
    tempCurrentVideo.value = null;
  }

  setTimeout(() => {
    resetUploadStatus();
    uploadKey.value++;
  }, 1000);
};

// 重置上传状态
const resetUploadStatus = () => {
  uploading.value = false;
  uploadPercent.value = 0;
  uploadedSize.value = 0;
  totalSize.value = 0;
};

// 删除视频
const handleRemove = () => {
  if (props.disabled || uploading.value) return;

  fileList.value = [];
  currentVideo.value = null;
  emit("update:modelValue", "");
  ElMessage.success("已删除视频");
  uploadKey.value++;
};

// 获取视频时长
const handleLoadedMetadata = (event: Event) => {
  const video = event.target as HTMLVideoElement;
  duration.value = video.duration;
};

// 格式化时长
const formatDuration = (seconds: number) => {
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");

  if (hh) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }
  return `${mm}:${ss}`;
};

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
// 刷新
const reset = () => {
  fileList.value = [];
  currentVideo.value = null;
  emit("update:modelValue", "");
  uploadKey.value++; // 强制重新渲染上传组件
};
// 初始化
init();
defineExpose({ reset });
</script>

<style scoped>
.video-uploader {
  width: 100%;
  /* max-width: 600px; */
}

.upload-progress {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.video-preview {
  margin-top: 20px;
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 4px;
  position: relative;
}

.video-player {
  width: 100%;
  max-height: 300px;
  background-color: #000;
  display: block;
}

.delete-btn {
  margin-top: 10px;
}
</style>