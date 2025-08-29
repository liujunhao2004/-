<template>
  <el-dialog title="新增" width="30%" v-model="visible" :before-close="handleClose">
    <el-form ref="form" :model="form" :rules="rules" label-position="left" label-width="150px">
      <el-card>
        <el-form-item label="诈骗类型描述" prop="tagDesc">
          <el-input v-model="form.tagDesc" type="textarea" />
        </el-form-item>
      </el-card>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="close"> 关闭 </el-button>
        <el-button type="primary" @click="submitForm"> 保存 </el-button>
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
      form: this.formdata(),
      rules: {
        tagDesc: [{ required: true, message: "诈骗类型描述不能为空！" }]
      }
    };
  },
  methods: {
    formdata() {
      return {
        tagDesc: ""
      };
    },
    handleClose(done) {
      done();
      this.close();
    },
    open() {
      this.visible = true;
    },
    close() {
      this.form = thgis.formdata();
      this.visible = false;
    },

    async submitForm() {
      console.log(this.form);
      try {
        const res = await baseService.post("exam/api/tag/add", this.form);
        this.$notify({
          message: "新增成功",
          type: "success",
          duration: 2000
        });
        this.close();
        this.$emit("refresh");
      } catch (error) {
        this.$message({
          message: "新增失败，请联系工作人员",
          type: "warning"
        });
        console.log("新增错误：", error);
      }
    }
  }
};
</script>
