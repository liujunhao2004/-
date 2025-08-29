<template>
  <el-dialog title="编辑" width="30%" v-model="visible" :close-on-click-modal="false">
    <el-form ref="form" :model="form" :rules="rules" label-position="left" label-width="150px">
      <el-card>
        <el-form-item label="诈骗类型描述" prop="tagDesc">
          <el-input v-model="form.tagDesc" type="textarea" />
        </el-form-item>
      </el-card>

      <el-row :gutter="20" type="flex" justify="end">
        <el-button type="info" @click="close" style="margin-top: 10px">关闭</el-button>
        <el-button type="primary" @click="submitForm" style="margin-top: 10px">保存</el-button>
      </el-row>
    </el-form>
  </el-dialog>
</template>
<script>
import baseService from "@/service/baseService";

export default {
  data() {
    return {
      visible: false,
      form: {
        tagDesc: ""
      },
      rules: {
        tagDesc: [{ required: true, message: "诈骗类型描述不能为空！" }]
      }
    };
  },
  methods: {
    open(record) {
      this.form = JSON.parse(JSON.stringify(record));
      this.visible = true;
      this.visible = true;
    },
    close() {
      this.$refs.form.resetFields();
      this.visible = false;
    },

    submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            const res = await baseService.post("exam/api/tag/update", this.form);
            this.$notify({
              title: "成功",
              message: "更新成功",
              type: "success",
              duration: 2000
            });
            this.close();
            this.$emit("refresh");
          } catch (error) {
            console.log("修改错误：", error);
          }
        } else {
          return false;
        }
      });
    }
  }
};
</script>
