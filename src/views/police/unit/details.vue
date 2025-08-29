<template>
  <el-dialog :title="typeText[type]" width="70%" v-model="visible" :close-on-click-modal="false">
    <el-form ref="form" :model="form" :rules="rules" label-position="left" label-width="150px">
      <el-card>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="派出所名称" prop="title">
              <el-input v-model="form.name" :disabled="disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="派出所电话" prop="title">
              <el-input v-model="form.mobile" :disabled="disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="派出所地址" prop="title">
              <el-input v-model="form.address" :disabled="disabled" />
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
        name: "",
        mobile: "",
        address: ""
      },

      rules: {
        name: [{ required: true, message: "派出所名称不能为空！" }],

        mobile: [{ required: true, message: "派出所电话不能为空！" }],
        address: [{ required: true, message: "派出所地址不能为空！" }]
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
            mobile: "",
            address: ""
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
        this.request("/policeStation/create");
        // 新增接口
      } else if (this.type === "upData") {
        this.request("/policeStation/update");
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
