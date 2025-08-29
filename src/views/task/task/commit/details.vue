<template>
  <el-dialog title="详情" width="70%" v-model="visible" :before-close="handleClose">
    <el-form ref="form" :model="form" label-position="right" label-width="120px">
      <el-card>
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name" disabled />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input v-model="form.description" disabled />
        </el-form-item>

        <el-form-item label="任务状态" prop="status">
          <el-tooltip :content="form.status == 1 ? '生效' : '失效'" placement="top">
            <el-switch v-model="form.status" :active-value="1" :inactive-value="0" disabled></el-switch>
          </el-tooltip>
        </el-form-item>

        <el-form-item label="所属民警" prop="policeOfficerDTOS">
          <el-select disabled style="width: 100%" v-model="form.policeOfficerDTOS" filterable remote multiple reserve-keyword placeholder="请输入关键词" :loading="loading">
            <el-option v-for="item in selectList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <!-- <div class="filter-container" style="margin-top: 25px">
          <el-button
            class="filter-item"
            type="primary"
            icon="el-icon-plus"
            size="small"
            plain
            @click="handleAdd"
          >
            添加
          </el-button>
        </div> -->
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>任务试题</span>
          </div>
          <el-table :data="form.questionList" :border="true" style="width: 100%; margin-top: 10px">
            <el-table-column label="序号" type="index" width="60"></el-table-column>
            <el-table-column label="题目类型" width="200">
              <template v-slot="scope">
                <el-select disabled v-model="scope.row.questionType" placeholder="请选择" style="width: 100%">
                  <el-option v-for="item in questionTypeData" :key="item.code" :label="item.name" :value="item.code"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="题目数量" width="200">
              <template v-slot="scope">
                <el-input-number disabled v-model="scope.row.number" :controls="false" :step="1" :min="1" :max="10" style="width: 100%"></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="单题时长/s" width="200">
              <template v-slot="scope">
                <el-input-number disabled v-model="scope.row.duration" :controls="false" :step="1" :min="0" :max="100" style="width: 100%"></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="诈骗类型">
              <template v-slot="scope">
                <el-select disabled v-model="scope.row.tagList" multiple filterable allow-create default-first-option placeholder="请选择" style="width: 100%">
                  <el-option v-for="item in tagList" :key="item.id" :label="item.tagDesc" :value="item.id"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <!-- <el-table-column label="操作" align="center" width="100px">
              <template v-slot="scope">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  circle
                  @click="removeItem(scope.$index)"
                />
              </template>
            </el-table-column> -->
          </el-table>
        </el-card>
      </el-card>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="info" @click="close">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script>
import baseService from "@/service/baseService";
import { questionTypeData } from "@/dictionary/index";
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
      visible: false,
      form: {
        status: 0,
        name: "",
        description: "",

        policeOfficerDTOS: [],
        questionList: []
      },
      selectList: [],
      restaurants: [],
      loading: false
    };
  },
  methods: {
    handleClose(done){
      done()
    },
    async getAll() {
      try {
        const response = await baseService.post("exam/api/police/queryAllPolice");
        this.restaurants = response.data || [];
        this.selectList = response.data || [];

        console.log(response.data, 9999999);
      } catch (error) {
        console.error("加载场所数据失败:", error);
        this.restaurants = [];
      }
    },

    // 打开弹框
    open(record) {
      this.getAll();

      let obj = JSON.parse(JSON.stringify(record));

      this.form = JSON.parse(JSON.stringify(obj));
      this.visible = true;
    },

    close() {
      this.visible = false;
    }
  }
};
</script>
<style scoped>
.centered-input /deep/ .el-input__inner {
  text-align: center;
}
</style>
