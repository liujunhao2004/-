<template>
  <el-dialog :title="typeText[type]" width="70%" v-model="visible" :close-on-click-modal="false">
    <el-form ref="form" :model="form" :rules="rules" label-position="left" label-width="150px">
      <el-card>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" :disabled="disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="学校名称" prop="schoolName">
              <el-input v-model="form.schoolName" :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="院系名称" prop="departmentId">
              <el-select v-model="form.departmentId" placeholder="请选择" :disabled="disabled">
                <el-option v-for="item in departmentList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="个人类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择" :disabled="disabled">
                <el-option v-for="item in personTypes" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="年级" prop="grade">
              <el-input v-model="form.grade" :disabled="disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="头像" prop="headImage">
              <uploadImage v-model="form.headImage" :disabled="disabled" />
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
        schoolId: ""
      },
      personTypes: [
        {
          name: "学生",
          id: 1
        },
        {
          name: "老师",
          id: 2
        },
        {
          name: "访客",
          id: 3
        }
      ],

      departmentList: [],

      rules: {
        name: [{ required: true, message: "姓名不能为空！" }],
        grade: [{ required: true, message: "年级不能为空！" }],
        type: [{ required: true, message: "个人类型不能为空！" }],

        departmentId: [{ required: true, message: "院系不能为空！" }]
      }
    };
  },
  methods: {
    // // 获取院系数据
    getDepartmentList() {
      baseService.post("/department/list", { schoolId: this.form.schoolId }).then((res) => {
        const data = res.data;

        this.departmentList = data.map((item) => ({
          id: item.id,
          name: item.name
        }));
      });
    },
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
        this.getDepartmentList(this.form.schoolId);
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
        this.request("/userInfo/create");
        // 新增接口
      } else if (this.type === "upData") {
        this.request("/userInfo/update");
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
