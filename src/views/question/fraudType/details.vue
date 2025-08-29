<template>
  <el-dialog :title="typeText[type]" width="70%" v-model="visible" :close-on-click-modal="false">
    <el-form ref="form" :model="form" :rules="rules" label-position="left" label-width="150px">
      <el-card>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="宣传类型" prop="tagDesc">
              <el-input v-model="form.tagDesc" :disabled="disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="反诈类型" prop="childrenScamTagList">
              <div class="flex gap-2">
                <el-tag class="m-r-10" v-for="(item, index) in form.childrenScamTagList" :key="index" closable :disable-transitions="false" @close="handleClose(index)">
                  {{ item.tagDesc }}
                </el-tag>
                <el-input v-if="inputVisible" placeholder="请输入" ref="InputRef" v-model="inputValue" class="w-20" size="small" @keyup.enter="handleInputConfirm" @blur="handleInputConfirm" />
                <el-button v-else class="button-new-tag" size="small" @click="showInput"> + 新增子项 </el-button>
              </div>
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
      inputValue: "",
      inputVisible: false,
      form: {
        tagDesc: "",
        childrenScamTagList: []
      },

      rules: {
        tagDesc: [{ required: true, message: "宣传类型不能为空！" }],

        childrenScamTagList: [{ required: true, message: "反诈类型不能为空！" }]
      }
    };
  },
  methods: {
    handleClose(index) {
      this.form.childrenScamTagList.splice(index, 1);
    },
    showInput() {
      this.inputValue = "";
      this.inputVisible = true;
    },

    handleInputConfirm() {
      if (this.inputValue) {
        this.form.childrenScamTagList.push({ tagDesc: this.inputValue });
      }
      this.inputVisible = false;
    },
    open(record) {
      this.type = record.type;
      this.visible = true;
      this.disabled = this.type === "detail";
      if (this.type === "add") {
        this.$nextTick(() => {
          (this.form = {
            tagDesc: "",
            childrenScamTagList: []
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
        this.request("/exam/api/tag/add");
        // 新增接口
      } else if (this.type === "upData") {
        this.request("/exam/api/tag/update");
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
.m-r-10 {
  margin-right: 10px;
}
.flex {
  display: flex;
  align-items: center;
}
</style>
