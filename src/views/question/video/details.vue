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

        <el-form-item label="警方提醒" prop="analysis">
          <el-input :disabled="disabled" v-model="form.analysis" :precision="1" :max="999999" type="textarea" placeholder="请输入警方提醒，如需换行请用\n分割" />
        </el-form-item>
        <el-form-item label="宣传时长/s" prop="duration">
          <el-input-number :disabled="disabled" v-model="form.duration" :controls="false" :step="1" :min="0" :max="100" style="width: 100%; text-align: right"></el-input-number>
        </el-form-item>
        <el-form-item label="试题视频">
          <VideoUpload ref="VideoUpload" :disabled="disabled" v-model="form.videoUrl" />
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
// import ImageUpload from "@/components/upload-image/index.vue";
import VideoUpload from "@/components/upload-video/index.vue";

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
  components: { VideoUpload },

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
      oldTagId: "",
      tagItemList: [],
      form: this.formdata(),
      rules: {
        tagId: [{ required: true, message: "宣传类型不能为空！" }],
        childrenTagId: [{ required: true, message: "诈骗类型不能为空！" }],
        title: [{ required: true, message: "题目内容不能为空！" }],
        analysis: [{ required: true, message: "整题解析不能为空！" }],
        videoUrl: [{ required: true, message: "试题视频不能为空！" }]
      }
    };
  },
  // watch: {
  //   // 监听form.tagId的变化
  //   "form.tagId": {
  //     handler(newVal, oldVal) {
  //       console.log("newVal", newVal, "oldVal", oldVal);
  //       if (this.type === "add") {
  //         newVal = this.tagList[0].id;
  //       }

  //       const item = this.tagList.find((item) => item.id === newVal);
  //       this.tagItemList = item.childrenScamTagList;

  //       if (newVal != oldVal && oldVal) {
  //         console.log("111", newVal, 22, oldVal);
  //         this.form.childrenTagId = null;
  //       }
  //     }
  //   }
  // },
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
        title: "",
        analysis: "",
        tagId: "",
        childrenTagId: null,

        duration: 0,
        videoUrl: ""
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
      // this.$nextTick(() => {
      //   this.form = this.formdata();
      //   this.$refs.form.resetFields();
      // });
      this.visible = false;
    },
    // 提交
    async submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          if (this.type === "add") {
            this.request("/exam/api/video/add");
            // 新增接口
          } else if (this.type === "upData") {
            this.request("/exam/api/video/update");
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
<style  scoped>
.el-input-number /deep/ .el-input__inner {
  text-align: left;
}
</style>
