<template>
  <el-dialog :title="typeText[type]" width="70%" v-model="visible" :close-on-click-modal="false">
    <el-form ref="form" :model="form" :rules="rules" label-position="left" label-width="150px">
      <el-card>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="所属单位" prop="policeStationId">
              <el-select v-model="form.policeStationId" placeholder="请选择" :disabled="disabled">
                <el-option v-for="item in policeStationList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="警号" prop="policeNo">
              <el-input v-model="form.policeNo" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="职务" prop="position">
              <el-input v-model="form.position" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="民警电话" prop="mobile">
              <el-input v-model="form.mobile" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="民警照片" prop="photoUrl">
              <uploadImage v-model="form.photoUrl" :disabled="disabled" />
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

export default {
  components: { uploadImage },

  props: {
    policeStationList: {
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
        policeStationId: "",
        name: "",
        policeNo: "",
        position: "",
        mobile: "",
        photoUrl: ""
      },

      rules: {
        policeStationId: [{ required: true, message: "所属单位不能为空！" }],
        name: [{ required: true, message: "姓名不能为空！" }],
        policeNo: [{ required: true, message: "警号不能为空！" }],
        position: [{ required: true, message: "职务不能为空！" }],
        mobile: [{ required: true, message: "民警电话不能为空！" }],

        photoUrl: [{ required: true, message: "民警照片不能为空！" }]
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
            policeStationId: "",
            name: "",
            policeNo: "",
            position: "",
            mobile: "",
            photoUrl: ""
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
        this.request("/exam/api/police/save");
        // 新增接口
      } else if (this.type === "upData") {
        this.request("/exam/api/police/update");
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
