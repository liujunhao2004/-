<template>
  <el-dialog title="详情" width="30%" v-model="visible" :close-on-click-modal="false">
    <el-form ref="form" :model="form" label-position="left" label-width="150px">
      <el-card>
        <el-form-item label="诈骗类型描述" prop="tagDesc">
          <el-input v-model="form.tagDesc" type="textarea" disabled />
        </el-form-item>
      </el-card>

      <el-row :gutter="20" type="flex" justify="end">
        <el-button type="info" @click="close"  style="margin-top: 10px;">关闭</el-button>
      </el-row>
    </el-form>
  </el-dialog>
</template>
<script>
export default {
  data() {
    return {
      visible: false,
      form: {
        tagDesc: ""
      }
    };
  },
  methods: {
    open(record) {
      this.form = record;
      this.visible = true;
    },
    close() {
      this.visible = false;
    }
  }
};
</script>
