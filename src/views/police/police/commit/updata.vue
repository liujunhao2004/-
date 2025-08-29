<template>
  <el-dialog title="更新" width="30%" v-model="visible" :before-close="handleClose">
    <el-form ref="form" :model="form" :rules="rules" label-position="right" label-width="120px">
      <el-card>
        <el-form-item label="警号" prop="policeNo">
          <el-input v-model="form.policeNo" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>

        <el-form-item label="职务" prop="position">
          <el-input v-model="form.position" />
        </el-form-item>

        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="form.mobile" />
        </el-form-item>

        <el-form-item label="单位" prop="unitName">
          <el-input v-model="form.unitName" />
        </el-form-item>

        <el-form-item label="报警电话" prop="alarmPhone">
          <el-input v-model="form.alarmPhone" />
        </el-form-item>

        <el-form-item label="民警照片">
          <image-upload v-model="form.photoUrl" />
        </el-form-item>
      </el-card>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="info" @click="close('form')">关闭</el-button>
        <el-button type="primary" @click="submitForm('form')">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script>
import baseService from "@/service/baseService";
import ImageUpload from "@/components/upload-image/index.vue";
import { validatePhone } from "@/utils/public";

export default {
  components: { ImageUpload },
  data() {
    return {
      visible: false,
      form: this.formdata(),
      rules: {
        policeNo: [{ required: true, message: "警号不能为空!" }],
        name: [{ required: true, message: "姓名不能为空!" }],
        unitName: [{ required: true, message: "单位不能为空!" }],
        mobile: [
          { required: true, message: "场所联系电话" },
          { validator: validatePhone, trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    open(record) {
      this.form = JSON.parse(JSON.stringify(record));
      this.visible = true;
    },
    handleClose(done) {
      done();
      this.close("form");
    },
    formdata() {
      return {
        policeNo: "",
        name: "",
        position: "",
        mobile: "",
        unitName: "",
        alarmPhone: "",
        photoUrl: ""
      };
    },
    close(formName) {
      this.$refs[formName].resetFields();
      this.form = this.formdata();
      this.visible = false;
    },
    async submitForm() {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.loadingInstance = this.$loading({
            lock: true,
            text: "正在生成三维码…",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
            customClass: "qr-loading--large"
          });

          try {
            const res = await baseService.post("exam/api/police/update", this.form);
            this.$notify({ title: "成功", message: "民警保存并生成三维码成功！", type: "success" });
            this.close("form");
            this.$emit("refresh");
          } catch (err) {
            this.$notify.error({ title: "失败", message: err.message || "生成失败" });
          } finally {
            // 3. 关掉加载
            this.loadingInstance.close();
          }
        } else {
          return false;
        }
      });
    }
  }
};
</script>
