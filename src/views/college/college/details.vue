<template>
  <el-dialog :title="typeText[type]" width="70%" v-model="visible" :close-on-click-modal="false">
    <el-form ref="form" :model="form" :rules="rules" label-position="left" label-width="150px">
      <el-card>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="学院名称" prop="title">
              <el-input v-model="form.name" :disabled="disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="关联民警" prop="policeId">
              <el-select v-model="form.policeId" placeholder="请选择" :disabled="disabled">
                <el-option v-for="item in policeList" :key="item.id" :label="item.unitName + '-' + item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="学院logo" prop="icon">
              <uploadImage v-model="form.icon" :disabled="disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="type != 'add'">
            <el-form-item label="学院三维码" prop="qrCode">
              <uploadImage v-model="form.qrCode" :disabled="disabled" />

              <!-- <el-image style="width: 100px; height: 100px" :src="form.qrCode" fit="cover" /> -->
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="type != 'add'">
            <el-form-item label="宣传海报" prop="posterUrl">
              <uploadImage v-model="form.posterUrl" :disabled="disabled" />

              <!-- <el-image style="width: 100px; height: 100px" :src="form.qrCode" fit="cover" /> -->
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <el-row :gutter="20" type="flex" justify="end">
        <el-button type="info" @click="close">关闭</el-button>
        <el-button type="primary" @click="submitForm" v-if="!disabled">保存</el-button>
      </el-row>
    </el-form>
  </el-dialog>
</template>
<script>
import baseService from "@/service/baseService";
import { ElMessage } from "element-plus";
import uploadImage from "@/components/upload-image/index.vue";
import uploadVideo from "@/components/upload-video/index.vue";

export default {
  components: { uploadImage, uploadVideo },

  props: {
    policeList: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      visible: false,
      disabled: false,
      type: "add",
      typeText: {
        add: "新增",
        upData: "编辑",
        detail: "详情"
      },

      form: {
        name: "",
        policeId: "",
        icon: "",
        qrCode: "",
        posterUrl: ""
      },

      rules: {
        name: [{ required: true, message: "学院名称不能为空！" }],

        policeId: [{ required: true, message: "关联民警不能为空！" }],
        icon: [{ required: true, message: "学院logo不能为空！" }]
      }
    };
  },
  methods: {
    open(record) {
      this.type = record.type;
      this.visible = true;
      this.disabled = this.type === "detail";
      if (this.type === "add") {
        this.$nextTick(() => {
          (this.form = {
            name: "",
            policeId: "",
            icon: "",
            qrCode: "",
            posterUrl: ""
          }),
            this.$refs.form.resetFields();
        });
      } else {
        this.form = JSON.parse(JSON.stringify(record.params));
      }
    },
    close() {
      this.visible = false;
    },
    request(url) {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          baseService.post(url, this.form).then((res) => {
            if (res.code === 0) {
              ElMessage.success(this.typeText[this.type] + "成功");
              this.$emit("refresh");
              this.close();
            } else {
              ElMessage.error(res.msg);
            }
          });
        } else {
          return;
        }
      });
    },

    submitForm() {
      if (this.type === "add") {
        this.request("/school/create");
        // 新增接口
      } else if (this.type === "upData") {
        this.request("/school/update");
        // 更新接口
      } else {
        this.visible = false;
      }
    }
  }
};
</script>
<style scoped>
.el-input-number /deep/ .el-input__inner {
  text-align: left;
}
</style>
