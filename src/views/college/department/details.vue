<template>
  <el-dialog :title="typeText[type]" width="70%" v-model="visible" :close-on-click-modal="false">
    <el-form ref="form" :model="form" :rules="rules" label-position="left" label-width="150px">
      <el-card>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="学院名称" prop="schoolId">
              <el-select v-model="form.schoolId" placeholder="请选择学院" :disabled="disabled">
                <el-option v-for="item in schoolList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="院系名称" prop="name">
              <el-input v-model="form.name" :disabled="disabled" placeholder="请输入院系名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="专业名称" prop="majorsIdList">
              <el-select v-model="form.majorsIdList" multiple placeholder="请选择专业名称" :disabled="disabled">
                <el-option v-for="item in majorsIdList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
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
    schoolList: {
      type: Array,
      default: () => []
    },
    majorsIdList: {
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
        schoolId: "",
        majorsIdList: []
      },

      rules: {
        name: [{ required: true, message: "院系名称不能为空！" }],

        schoolId: [{ required: true, message: "关联学校不能为空！" }],
        majorsIdList: [{ required: true, message: "专业不能为空！" }]
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
            schoolId: ""
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
        this.request("/department/create");
        // 新增接口
      } else if (this.type === "upData") {
        this.request("/department/update");
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
