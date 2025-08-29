<template>
  <el-dialog :title="typeText[type]" width="70%" v-model="visible">
    <el-form ref="form" v-if="form" :model="form" :rules="rules" label-position="left" label-width="150px">
      <el-card>
        <el-form-item label="宣传类型" prop="tagId">
          <el-select v-model="form.tagId" :disabled="disabled" placeholder="请选择" style="width: 100%" @change="tagChange">
            <el-option v-for="item in tagList" :key="item.id" :label="item.tagDesc" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="诈骗类型" prop="childrenTagId">
          <el-select v-model="form.childrenTagId" :disabled="disabled" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in tagItemList" :key="item.id" :label="item.tagDesc" :value="item.id"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="题目内容" prop="title">
          <el-input v-model="form.title" type="textarea" :disabled="disabled" />
        </el-form-item>

        <el-form-item label="整题解析" prop="analysis">
          <el-input v-model="form.analysis" :precision="1" :max="999999" type="textarea" :disabled="disabled" />
        </el-form-item>
        <el-form-item label="试题图片" prop="imageUrl">
          <image-upload v-model="form.imageUrl" :multiple="true" />
        </el-form-item>
      </el-card>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="info" @click="close()">关闭</el-button>
        <el-button type="primary" @click="submitForm()" v-if="!disabled">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script>
import ImageUpload from "@/components/upload-image/index.vue";

import baseService from "@/service/baseService";
// import { questionType, fraudType } from "@/dictionary/index";
import { ElMessage } from "element-plus";

export default {
  props: {
    tagList: {
      type: Array,
      default: () => []
    }
  },
  components: { ImageUpload },

  data() {
    return {
      // questionType,
      // fraudType,
      visible: false,
      disabled: false,
      type: "add",
      typeText: {
        add: "新增",
        upData: "编辑",
        detail: "详情"
      },
      oldTagId: null,
      tagItemList: [],
      form: this.formdata(),
      rules: {
        tagId: [{ required: true, message: "宣传类型不能为空！" }],
        childrenTagId: [{ required: true, message: "诈骗类型不能为空！" }],
        title: [{ required: true, message: "题目内容不能为空！" }],
        analysis: [{ required: true, message: "整题解析不能为空！" }],
        imageUrl: [{ required: true, message: "题目类型不能为空！" }]
      }
    };
  },
  methods: {
    tagChange(val) {
      const item = this.tagList.find((item) => item.id === val);
      this.tagItemList = item.childrenScamTagList;
      if (val != this.oldTagId) {
        this.form.childrenTagId = null;
      }
    },
    // 初始化数据
    formdata() {
      return {
        tagId: null,
        childrenTagId: null,
        title: "",
        analysis: null,
        imageUrl: []
      };
    },
    // 打开弹框
    open(record) {
      this.type = record.type;
      this.visible = true;
      this.disabled = this.type === "detail";
      if (this.type === "add") {
        this.$nextTick(() => {
          this.oldTagId = null;

          this.form = this.formdata();
          this.$refs.form.resetFields();
        });
      } else {
        this.form = JSON.parse(JSON.stringify(record.params));
        this.oldTagId = this.form.tagId;

        this.tagChange(this.form.tagId);
        console.log(this.form);
      }
    },

    // 关闭弹框
    close() {
      this.visible = false;
    },
    // 提交
    async submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          if (this.type === "add") {
            this.request("/exam/api/poster/add");
            // 新增接口
          } else if (this.type === "upData") {
            this.request("/exam/api/poster/update");
            // 更新接口
          } else {
            this.visible = false;
          }
        } else {
          return false;
        }
      });
    },
    // 请求
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
    }
  }
};
</script>
<style lang="scss" scoped>
.filter-container {
  margin-top: 12px !important;
}
</style>
