<template>
  <div>
    <el-card class="box-card">
      <el-form :model="requestForm" label-width="100px">
        <el-row :gutter="20" type="flex" justify="space-between" style="flex-wrap: wrap">
          <el-col :span="8">
            <el-form-item label="任务名称">
              <el-input v-model="requestForm.params.name" placeholder="请输入任务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="任务状态">
              <el-select v-model="requestForm.params.status" placeholder="请选择" style="width: 100%">
                <el-option v-for="item in taskStatus" :key="item.code" :label="item.name" :value="item.code"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-button type="primary" @click="query">查询</el-button>
            <el-button type="info" @click="refresh">重置</el-button>
            <el-button type="primary" @click="$refs.detail.open({ type: 'add' })">新增</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <el-card class="box-card">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="{
          background: '#f2f3f4',
          color: '#555',
          'font-weight': 'bold',
          'line-height': '32px'
        }"
      >
        <el-table-column prop="name" label="任务名称" align="center"></el-table-column>
        <el-table-column prop="description" label="任务描述" align="center"></el-table-column>
        <el-table-column prop="status" label="状态" align="center">
          <template v-slot="scope">
            {{ getListName(taskStatus, scope.row.status) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="$refs.detail.open({ type: 'detail', params: scope.row })"> 详情 </el-button>

            <el-popconfirm class="box-item" title="确定删除这条数据吗？" placement="top-start" @confirm="deleteFn(scope.row)">
              <template #reference>
                <el-button link type="danger" size="small"> 删除 </el-button>
              </template>
            </el-popconfirm>

            <el-button link type="primary" size="small" @click="$refs.detail.open({ type: 'upData', params: scope.row })"> 编辑 </el-button>
          </template>
        </el-table-column>

        <!-- <el-table-column fixed="right" label="操作" width="150" align="center">
          <template v-slot="scope">
            <el-button type="info" icon="View" circle @click="$refs.detail.open(scope.row)" />
            <el-button type="primary" icon="Edit" circle @click="$refs.updata.open(scope.row)" />
            <el-popconfirm class="box-item" title="确定删除这条数据吗？" placement="top-start" @confirm="deleteFn(scope.row)">
              <template #reference>
                <el-button type="danger" icon="Delete" circle />
              </template>
            </el-popconfirm>
          </template>
        </el-table-column> -->
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="requestForm.current" :page-sizes="[10, 20, 30, 40]" :page-size="requestForm.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="requestForm.total"> </el-pagination>
    </el-card>

    <!-- <add ref="add" @refresh="refresh" :tagList="tagList"></add>
    <updata ref="updata" @refresh="refresh" :tagList="tagList"></updata> -->
    <detail ref="detail" @refresh="refresh" :tagList="tagList"></detail>
  </div>
</template>

<script>
// import add from "./commit/add.vue";
// import detail from "./commit/details.vue";
// import updata from "./commit/updata.vue";
import detail from "./details.vue";

import { taskStatus } from "@/dictionary/index";
import { getName } from "@/utils/public";
import baseService from "@/service/baseService";
export default {
  components: {
    // add,
    // updata,
    detail
  },
  data() {
    return {
      tagList: [],
      taskStatus,
      requestForm: {
        current: 1,
        pageSize: 10,
        total: 0,
        params: {
          status: "",
          name: ""
        }
      },
      loading: true,
      importVisible: false,
      tableData: []
    };
  },
  created() {
    this.getList();
    this.getTagList();
  },
  methods: {
    // 获取反诈类型
    async getTagList() {
      const res = await baseService.post("exam/api/tag/listPage", { current: 1, size: 1000 });
      this.tagList = res.data.list;
    },
    query() {
      if (this.isParamsAllEmpty()) {
        return this.$message({
          message: "请至少输入一个查询信息！",
          type: "warning"
        });
      }
      this.loading = true;
      this.getList();
      this.$notify({
        title: "查询成功",
        type: "success",
        duration: 2000
      });
    },
    isParamsAllEmpty() {
      const { status, name } = this.requestForm.params;
      return (status === "" || status === undefined || status === null) && (name === "" || name === undefined || name === null);
    },

    // 查询字典
    getListName(data, code) {
      return getName(data, code);
    },
    // 获取列表数据
    async getList() {
      const res = await baseService.post("exam/api/answering/task/pageList", this.requestForm);
      this.requestForm.total = res.data.total;
      this.tableData = res.data.list;
      this.loading = false;
    },
    // 删除数据
    async deleteFn(val) {
      try {
        await baseService.post("exam/api/answering/task/delete", { id: val.id });

        this.$notify({
          title: "成功",
          message: "删除成功",
          type: "success",
          duration: 2000
        });
        this.getList();
      } catch (error) {
        console.log("删除失败", error);
      }
    },
    // 刷新
    refresh() {
      (this.requestForm = {
        current: 1,
        pageSize: 10,
        total: 0,
        params: {
          status: "",
          name: ""
        }
      }),
        (this.loading = true);
      this.getList();
    },

    // 页数改变
    handleCurrentChange(val) {
      this.requestForm.current = val;
      this.requestForm.pageSize = 10;
      this.loading = true;
      this.getList();
    },
    handleSizeChange(val) {
      this.requestForm.current = 1;
      this.requestForm.pageSize = val;
      this.loading = true;
      this.getList();
    }
  }
};
</script>
<style scoped>
.box-card {
  margin: 5px;
}
.m-l-r-10 {
  margin: 0 10px;
}
</style>

