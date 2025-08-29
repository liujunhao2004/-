<template>
  <el-dialog :title="typeText[type]" width="70%" v-model="visible" :before-close="handleClose">
    <el-form ref="form" :model="form" :rules="rules" label-position="right" label-width="120px">
      <el-card>
        <el-row :gutter="20" type="flex" justify="space-between" style="flex-wrap: wrap">
          <el-col :span="24">
            <el-form-item label="设备型号" prop="deviceModelName">
              <el-input v-model="form.deviceModelName" :disabled="disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="绑码数量" prop="maxQrcodes">
              <el-input-number :disabled="disabled" v-model="form.maxQrcodes" :controls="false" :step="1" :min="1" :max="10" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="info" @click="close('form')">关闭</el-button>
        <el-button type="primary" @click="submitForm('form')" v-if="!disabled">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script>
import baseService from "@/service/baseService";

export default {
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
        deviceModelName: "",
        maxQrcodes: 1
      },
      rules: {
        deviceModelName: [{ required: true, message: "设备型号" }],
        maxQrcodes: [{ required: true, message: "绑码数量" }]
      }
    };
  },
  computed: {},
  methods: {
    handleClose(done) {
      done();
      this.close("form");
    },
    open(record) {
      this.type = record.type;
      this.visible = true;
      this.disabled = this.type === "detail";
      if (this.type === "add") {
        this.$nextTick(() => {
          this.form = {
            deviceModelName: "",
            maxQrcodes: 1
          };
        });
        if (this.$refs.form) {
          this.$refs.form.resetFields();
        }
      } else {
        this.form = JSON.parse(JSON.stringify(record.params));
      }
    },
    close(formName) {
      this.$refs[formName].resetFields();

      this.visible = false;
    },
    async request(apiFunc) {
      try {
        const response = await apiFunc(this.form);
        if (response.code === 0) {
          this.$notify({
            title: "成功",
            message: this.typeText[this.type] + "成功",
            type: "success",
            duration: 2000
          });
          this.close("form");
          this.$emit("refresh");
        } else {
          this.$notify({
            message: response.msg || "操作失败",
            type: "warning",
            duration: 2000
          });
        }
      } catch (error) {
        this.$notify({
          message: "网络错误，请稍后重试",
          type: "error",
          duration: 2000
        });
        console.error("请求错误:", error);
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.type === "add") {
            this.request((form) => baseService.post("exam/api/deviceModel/add", form));
          } else if (this.type === "upData") {
            this.request((form) => baseService.post("exam/api/deviceModel/update", form));
          } else {
            this.visible = false;
          }
        } else {
          return false;
        }
      });
    }
  }
};
</script>
<style scoped>
.el-input-number /deep/ .el-input__inner {
  text-align: left;
}
</style>
