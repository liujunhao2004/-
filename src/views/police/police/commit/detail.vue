a<template>
  <el-dialog title="更新" width="30%" v-model="visible" :before-close="handleClose">
    <el-form ref="form" :model="form" label-position="right" label-width="120px">
      <el-card>
        <el-form-item label="警号" prop="policeNo">
          <el-input v-model="form.policeNo" disabled />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" disabled />
        </el-form-item>

        <el-form-item label="职务" prop="position">
          <el-input v-model="form.position" disabled />
        </el-form-item>

        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="form.mobile" disabled />
        </el-form-item>

        <el-form-item label="单位" prop="unitName">
          <el-input v-model="form.unitName" disabled />
        </el-form-item>

        <el-form-item label="报警电话" prop="alarmPhone">
          <el-input v-model="form.alarmPhone" disabled />
        </el-form-item>

        <el-form-item label="民警照片">
          <el-image style="width: 100px; height: 100px" :src="form.photoUrl" :preview-src-list="[form.photoUrl]"></el-image>
          <!-- <file-upload v-model="form.photoUrl" accept=".jpg,.jepg,.png" /> -->
        </el-form-item>
      </el-card>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="info" @click="close">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script>
export default {
  data() {
    return {
      visible: false,
      form: {
        policeNo: "",
        name: "",
        position: "",
        mobile: "",
        unitName: "",
        alarmPhone: "",
        photoUrl: ""
      }
    };
  },
  methods: {
    handleClose(done) {
      done();
    },
    open(record) {
      this.form = record;
      this.visible = true;
    },
    close() {
      this.visible = false;
    }
    // async submitForm() {
    //   this.loadingInstance = this.$loading({
    //     lock: true,
    //     text: '正在生成三维码…',
    //     spinner: 'el-icon-loading',
    //     background: 'rgba(0, 0, 0, 0.7)',
    //     customClass: 'qr-loading--large'
    //   })

    //   try {
    //     const response = await policeSave(this.form)
    //     // this.form = response.data
    //     this.$notify({ title: '成功', message: '民警保存并生成三维码成功！', type: 'success' })
    //     this.close()
    //     this.$emit('refresh')
    //   } catch (err) {
    //     this.$notify.error({ title: '失败', message: err.message || '生成失败' })
    //   } finally {
    //     // 3. 关掉加载
    //     this.loadingInstance.close()
    //   }
    // }
  }
};
</script>
