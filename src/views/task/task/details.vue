<template>
  <el-dialog :title="typeText[type]" width="70%" v-model="visible">
    <el-form ref="form" :model="form" :rules="rules" label-position="right" label-width="120px">
      <el-card>
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name" :disabled="disabled" />
        </el-form-item>
        <el-form-item label="任务类型" prop="type">
          <el-select :disabled="disabled" v-model="form.type" filterable allow-create default-first-option placeholder="请选择" style="width: 100%">
            <el-option v-for="item in taskList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input :disabled="disabled" v-model="form.description" />
        </el-form-item>

        <el-form-item label="任务状态" prop="status">
          <el-tooltip :content="form.status == 1 ? '生效' : '失效'" placement="top">
            <el-switch :disabled="disabled" v-model="form.status" :active-value="1" :inactive-value="0"></el-switch>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="是否参与福利" prop="reward">
          <el-tooltip :content="form.reward == 1 ? '参与福利' : '不参与福利'" placement="top">
            <el-switch :disabled="disabled" v-model="form.reward" :active-value="1" :inactive-value="0"></el-switch>
          </el-tooltip>
        </el-form-item>

        <el-form-item label="宣传类型" prop="tagId">
          <el-select :disabled="disabled" @change="tagChange" v-model="form.tagId" filterable allow-create default-first-option placeholder="请选择" style="width: 100%">
            <el-option v-for="item in tagList" :key="item.id" :label="item.tagDesc" :value="item.id"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="所属民警" v-if="form.type == 1" prop="policeOfficerDTOS">
          <el-select :disabled="disabled" style="width: 100%" v-model="form.policeOfficerDTOS" filterable remote multiple reserve-keyword placeholder="请输入关键词" :remote-method="remoteMethod" :loading="loading">
            <el-option v-for="item in selectList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <div class="filter-container" style="margin-top: 25px">
          <el-button :disabled="disabled" icon="Check" type="success" size="small" plain @click="handleAdd" style="margin-bottom: 10px"> 添加 </el-button>
        </div>
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>任务试题</span>
          </div>
          <el-table :data="form.questionList" :border="true" style="width: 100%; margin-top: 10px">
            <el-table-column label="序号" type="index" width="60"></el-table-column>
            <el-table-column label="题目类型" width="150">
              <template v-slot="scope">
                <el-select :disabled="disabled" v-model="scope.row.questionType" placeholder="请选择" style="width: 100%" @change="(value) => questionTypeChange(value, scope.$index)">
                  <el-option v-for="item in questionTypeData" :key="item.code" :label="item.name" :value="item.code"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <!-- <el-table-column label="单题分数" width="100">
              <template v-slot="scope">
                <el-input-number :disabled="disabled" v-model="scope.row.score‌" :controls="false" :step="1" :min="1" :max="10" style="width: 100%"></el-input-number>
              </template>
            </el-table-column> -->
            <el-table-column label="题目数量" width="100">
              <template v-slot="scope">
                <el-input-number :disabled="disabled" v-model="scope.row.number" :controls="false" :step="1" :min="1" :max="10" style="width: 100%"></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="单题时长/s" width="100">
              <template v-slot="scope">
                <el-input-number :disabled="disabled" v-model="scope.row.duration" :controls="false" :step="1" :min="0" :max="100" style="width: 100%"></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="诈骗类型">
              <template v-slot="scope">
                <el-select :disabled="disabled" v-model="scope.row.childrenTagList" multiple filterable allow-create default-first-option placeholder="请选择" style="width: 100%">
                  <el-option v-for="item in tagItemList" :key="item.id" :label="item.tagDesc" :value="item.id"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="200px">
              <template v-slot="scope">
                <el-button-group>
                  <el-button :disabled="disabled" size="small" type="info" icon="Bottom" @click="declineItem(scope.$index)" />
                  <el-button :disabled="disabled" size="small" type="info" icon="Top" @click="riseItem(scope.$index)" />
                  <el-button :disabled="disabled" size="small" type="danger" icon="Delete" @click="removeItem(scope.$index)" />
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
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
import { questionTypeData, taskList } from "@/dictionary/index";
import baseService from "@/service/baseService";
import { ElMessage } from "element-plus";

export default {
  props: {
    tagList: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      questionTypeData,
      taskList,
      tagItemList: [],
      visible: false,

      disabled: false,
      type: "add",
      typeText: {
        add: "新增",
        upData: "编辑",
        detail: "详情"
      },
      form: this.formdata(),
      // policeOfficerDTOS: [],
      selectList: [],
      restaurants: [],
      loading: false,
      rules: {
        name: [{ required: true, message: "任务名称不能为空!" }],
        type: [{ required: true, message: "任务类型不能为空!" }],
        tagId: [{ required: true, message: "宣传类型不能为空!" }],
        description: [{ required: true, message: "任务描述不能为空!" }],
        status: [{ required: true, message: "任务状态不能为空!" }],
        policeOfficerDTOS: [
          {
            validator: (rule, value, callback) => {
              if (this.form.type === 1 && (!value || value.length === 0)) {
                callback(new Error("请至少选择一名民警"));
              } else {
                callback();
              }
            },
            trigger: ["change", "blur"] // 同时监听change和blur事件
          }
        ]
      }
    };
  },
  watch: {
    // 监听form.tagId的变化
    "form.type": {
      handler(newVal, oldVal) {
        console.log("newVal", newVal, "oldVal", oldVal);
        if (newVal == 1) {
          this.form.reward = 1;
        }
      }
    }
  },
  methods: {
    tagChange(val) {
      const item = this.tagList.find((item) => item.id === val);
      this.tagItemList = item.childrenScamTagList;
    },
    questionTypeChange(value, index) {
      if (this.checkQuestionType(this.form.questionList, value, index)) {
        this.$message.error("已存在同类型题，请勿重复添加");
        this.form.questionList[index].questionType = "";
      }
    },
    // 校验子项
    checkQuestionType(list, value, currentIndex) {
      return list.some((item, index) => {
        return index !== currentIndex && item.questionType === value;
      });
    },
    // 上升项（向上移动）
    riseItem(index) {
      console.log(index, "上升项（向上移动）");
      if (index <= 0) {
        this.$notify.error("已经是第一项了");
        return;
      }
      // 交换当前项和前一项的位置
      const temp = this.form.questionList[index - 1];
      this.form.questionList[index - 1] = this.form.questionList[index];
      this.form.questionList[index] = temp;
    },

    // 下降项
    declineItem(index) {
      if (index >= this.form.questionList.length - 1) {
        this.$notify.error("已经是最后一项了");
        return;
      }
      const temp = this.form.questionList[index + 1];
      this.form.questionList[index + 1] = this.form.questionList[index];
      this.form.questionList[index] = temp;
    },
    // 删除子项
    removeItem(index) {
      this.form.questionList.splice(index, 1);
    },
    // 添加子项
    handleAdd() {
      console.log(this.form);

      this.form.questionList.push({ questionType: "", number: 1, duration: 0, childrenTagList: [] });
    },
    async getAll() {
      try {
        const response = await baseService.post("exam/api/police/queryAllPolice");
        this.restaurants = response.data || [];
        console.log(response.data, 9999999);
      } catch (error) {
        console.error("加载场所数据失败:", error);
        this.restaurants = [];
      }
    },
    // 根据关键字查询民警
    remoteMethod(query) {
      console.log(query);
      if (query !== "") {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.selectList = this.restaurants.filter((item) => {
            return item.name && item.name.includes(query);
          });
        }, 200);
      } else {
        this.selectList = this.restaurants;
      }
    },
    // 初始化数据
    formdata() {
      return {
        status: 0,
        name: "",
        tagId: "",
        description: "",
        type: null,
        reward: "",
        policeOfficerDTOS: [],
        questionList: []
      };
    },
    //打开弹框
    open(record) {
      this.type = record.type;
      this.visible = true;
      this.disabled = this.type === "detail";
      this.getAll();
      if (this.type === "add") {
        this.$nextTick(() => {
          this.form = this.formdata();
          this.$refs.form.resetFields();
        });
      } else {
        this.form = JSON.parse(JSON.stringify(record.params));
        this.tagChange(this.form.tagId);
        // console.log(this.form);
      }
    },

    // open() {
    //   (this.form = {
    //     status: 0,
    //     name: "",
    //     description: "",

    //     policeOfficerDTOS: [],
    //     questionList: []
    //   }),
    //     this.getAll();
    //   this.visible = true;
    // },
    close() {
      // this.$refs[formName].resetFields();
      this.visible = false;
    },
    submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          if (this.type === "add") {
            this.request("/exam/api/answering/task/add");
            // 新增接口
          } else if (this.type === "upData") {
            this.request("/exam/api/answering/task/update");
            // 更新接口
          } else {
            this.visible = false;
          }
        } else {
          return false;
        }
      });

      //   this.$refs[formName].validate(async (valid) => {
      //     if (valid) {
      //       try {
      //         const response = await baseService.post("/exam/api/answering/task/add", this.form);
      //         this.$notify({ title: "成功", message: "新增成功", type: "success" });
      //         this.close("form");
      //         this.$emit("refresh");
      //       } catch (err) {
      //         this.$notify.error({ title: "失败", message: err.message || "新增失败" });
      //       } finally {
      //       }
      //     } else {
      //       return false;
      //     }
      //   });
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
<style scoped>
.centered-input /deep/ .el-input__inner {
  text-align: center;
}
</style>