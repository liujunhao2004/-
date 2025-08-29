<template>
  <el-dialog title="新增" width="30%" v-model="visible" :before-close="handleClose">
    <el-form ref="form" :model="form" :rules="rules" label-position="left" label-width="150px">
      <el-card>
        <el-form-item label="诈骗类型" prop="tagId">
          <el-select v-model="form.tagId" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in tagList" :key="item.id" :label="item.tagDesc" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题目类型" prop="questionType">
          <el-select v-model="form.questionType" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in questionType" :key="item.code" :label="item.name" :value="item.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题目内容" prop="content">
          <el-input v-model="form.content" type="textarea" />
        </el-form-item>

        <el-form-item label="整题解析" prop="analysis">
          <el-input v-model="form.analysis" :precision="1" :max="999999" type="textarea" />
        </el-form-item>
      </el-card>

      <div class="filter-container" style="margin-top: 25px">
        <el-button icon="Check" type="success" size="small" plain @click="handleAdd" style="margin-bottom: 10px"> 添加 </el-button>

        <el-table :data="form.answers" :border="true" style="width: 100%">
          <el-table-column label="是否答案" width="120" align="center">
            <template v-slot="scope">
              <el-checkbox v-model="scope.row.correctAnswer" :true-value="1" :false-label="0" @change="checkboxFn(scope.$index)"> 答案 </el-checkbox>
            </template>
          </el-table-column>

          <el-table-column label="答案内容">
            <template v-slot="scope">
              <el-input v-model="scope.row.optionContent" type="textarea" />
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="100px">
            <template v-slot="scope">
              <el-button type="danger" icon="Delete" circle @click="removeItem(scope.$index)" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="info" @click="close"> 关闭 </el-button>
        <el-button type="primary" @click="submitForm"> 保存 </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script>
import { questionType } from "@/dictionary/index";
import baseService from "@/service/baseService";

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
      // fraudType,
      visible: false,
      form: this.formdata(),
      rules: {
        tagId: [{ required: true, message: "诈骗类型不能为空！" }],
        content: [{ required: true, message: "题目内容不能为空！" }],
        analysis: [{ required: true, message: "整题解析不能为空！" }],

        questionType: [{ required: true, message: "题目类型不能为空！" }]
      }
    };
  },
  methods: {
    formdata() {
      return {
        tagId: "",
        questionType: 1,
        content: null,
        analysis: null,
        answers: []
      };
    },
    handleClose(done) {
      done();
      this.close();
    },
    open(record) {
      this.form = JSON.parse(JSON.stringify(record));
      this.visible = true;
    },
    close() {
      this.$refs.form.resetFields();
      this.visible = false;
    },
    async submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          let rightCount = 0;
          this.form.answers.forEach(function (item) {
            if (item.correctAnswer) {
              rightCount += 1;
            }
          });
          if (this.form.questionType === 1) {
            if (rightCount !== 1) {
              this.$message({
                message: "请选择单选题答案",
                type: "warning"
              });

              return;
            }
          }
          if (this.form.questionType === 2) {
            if (rightCount < 1) {
              this.$message({
                message: "请选择多选题答案",
                type: "warning"
              });

              return;
            }
          }
          if (this.form.questionType === 3) {
            if (rightCount !== 1) {
              this.$message({
                message: "请选择判断题答案",
                type: "warning"
              });

              return;
            }
          }
          console.log(this.form);
          try {
            const res = await baseService.post("exam/api/question/update", this.form);
            this.$notify({
              title: "成功",
              message: "更新成功",
              type: "success",
              duration: 2000
            });
            this.close();
            this.$emit("refresh");
          } catch (error) {
            console.log("编辑失败：", error);
          }
        } else {
          return false;
        }
      });
    },
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
