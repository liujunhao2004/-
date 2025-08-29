<template>
  <el-dialog :title="typeText[type]" width="70%" v-model="visible">
    <el-form ref="form" v-if="form" :model="form" :rules="rules" label-position="left" label-width="150px">
      <el-card>
        <el-form-item label="宣传类型" prop="tagId">
          <el-select v-model="form.tagId" :disabled="disabled" placeholder="请选择" style="width: 100%" @change="tagChange">
            <el-option v-for="item in tagList" :key="item.id" :label="item.tagDesc" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="诈骗类型" prop="tagId">
          <el-select v-model="form.childrenTagId" :disabled="disabled" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in tagItemList" :key="item.id" :label="item.tagDesc" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题目类型" prop="questionType">
          <el-select v-model="form.questionType" :disabled="disabled" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in questionType" :key="item.code" :label="item.name" :value="item.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题目内容" prop="content">
          <el-input v-model="form.content" type="textarea" :disabled="disabled" />
        </el-form-item>

        <el-form-item label="整题解析" prop="analysis">
          <el-input v-model="form.analysis" :precision="1" :max="999999" type="textarea" :disabled="disabled" />
        </el-form-item>
      </el-card>

      <div class="filter-container" style="margin-top: 25px">
        <el-button icon="Check" :disabled="disabled" type="success" size="small" plain @click="handleAdd" style="margin-bottom: 10px"> 添加 </el-button>

        <el-table :data="form.answers" :border="true" style="width: 100%">
          <el-table-column label="是否答案" width="120" align="center">
            <template v-slot="scope">
              <el-checkbox :disabled="disabled" v-model="scope.row.correctAnswer" :true-value="1" :false-label="0" @change="checkboxFn(scope.$index)"> 答案 </el-checkbox>
            </template>
          </el-table-column>

          <el-table-column label="答案内容">
            <template v-slot="scope">
              <el-input :disabled="disabled" v-model="scope.row.optionContent" type="textarea" />
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="100px">
            <template v-slot="scope">
              <el-button :disabled="disabled" type="danger" icon="Delete" circle @click="removeItem(scope.$index)" />
            </template>
          </el-table-column>
        </el-table>
      </div>
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
import baseService from "@/service/baseService";
import { questionType, fraudType } from "@/dictionary/index";
import { ElMessage } from "element-plus";

export default {
  props: {
    tagList: {
      type: Array,
      default: () => []
    }
  },
  components: {},
  data() {
    return {
      questionType,
      fraudType,
      visible: false,
      disabled: false,
      type: "add",
      typeText: {
        add: "新增",
        upData: "编辑",
        detail: "详情"
      },
      oldTagId: null,
      tips: {
        1: "单选",
        2: "多选",
        3: "判断"
      },
      tagItemList: [],
      form: this.formdata(),
      rules: {
        tagId: [{ required: true, message: "宣传类型不能为空！" }],
        childrenTagId: [{ required: true, message: "诈骗类型不能为空！" }],
        content: [{ required: true, message: "题目内容不能为空！" }],
        analysis: [{ required: true, message: "整题解析不能为空！" }],
        questionType: [{ required: true, message: "题目类型不能为空！" }]
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
        questionType: 1,
        content: null,
        analysis: null,
        answers: []
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
        const questionType = this.form.questionType;
        if (valid) {
          let rightCount = 0;
          this.form.answers.forEach(function (item) {
            if (item.correctAnswer) {
              rightCount += 1;
            }
          });
          if (questionType === 1 || questionType === 3) {
            if (rightCount !== 1) {
              ElMessage.warning("请选择" + this.tips[questionType] + "题答案");

              return;
            }
          }
          if (questionType === 2) {
            if (rightCount < 1) {
              ElMessage.warning("请选择" + this.tips[questionType] + "题答案");

              return;
            }
          }

          if (this.type === "add") {
            this.request("/exam/api/question/add");
            // 新增接口
          } else if (this.type === "upData") {
            this.request("/exam/api/question/update");
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
    },
    // 单选
    checkboxFn(val) {
      if (this.form.questionType === 1 || this.form.questionType === 3) {
        if (this.form.answers[val].correctAnswer == 1) {
          for (let index in this.form.answers) {
            if (index != val) {
              this.form.answers[index].correctAnswer = 0;
            }
          }
        }
      }
    },
    // 添加子项
    handleAdd() {
      this.form.answers.push({ correctAnswer: 0, optionContent: "" });
    },
    // 删除
    removeItem(index) {
      this.form.answers.splice(index, 1);
    }
  }
};
</script>
<style lang="scss" scoped>
.filter-container {
  margin-top: 12px !important;
}
</style>
