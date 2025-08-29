<template>
  <div>
    <el-card class="box-card">
      <el-form :model="requestForm" label-width="100px">
        <el-row :gutter="20" type="flex" justify="space-between" style="flex-wrap: wrap">
          <el-col :span="6">
            <el-form-item label="设配型号">
              <el-input v-model="requestForm.params.deviceModelName"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-button type="primary" @click="query">查询</el-button>
            <el-button type="info" @click="refresh">重置</el-button>
            <el-button type="primary" @click="$refs.add.open({ type: 'add' })">新增</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <el-card class="box-card">
      <el-table
        :data="tableData"
        border
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{
          background: '#f2f3f4',
          color: '#555',
          'font-weight': 'bold',
          'line-height': '32px'
        }"
      >
        <el-table-column prop="deviceModelName" label="设备型号" align="center"></el-table-column>
        <el-table-column prop="maxQrcodes" label="绑码数量" align="center"></el-table-column>

        <el-table-column prop="createTime" align="center" label="创建时间"></el-table-column>
        <el-table-column fixed="right" label="操作" width="150" align="center">
          <template v-slot="scope">
            <el-button link type="primary" size="small" @click="$refs.add.open({ type: 'detail', params: scope.row })">详情</el-button>
            <el-button link type="primary" size="small" @click="$refs.add.open({ type: 'upData', params: scope.row })">编辑</el-button>
            <el-popconfirm class="box-item" title="确定删除这条数据吗？" placement="top-start" @confirm="deleteFn(scope.row)">
              <template #reference>
                <el-button link type="danger" size="small"> 删除 </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="requestForm.current" :page-sizes="[10, 20, 30, 40]" :page-size="requestForm.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="requestForm.total"> </el-pagination>
    </el-card>

    <add ref="add" @refresh="refresh"></add>
  </div>
</template>

<script>
import add from "./commit/add.vue";
import baseService from "@/service/baseService";
export default {
  components: { add },
  data() {
    return {
      loading: true,
      requestForm: {
        current: 1,
        pageSize: 10,
        total: 0,
        params: {
          deviceModelName: ""
        }
      },
      tableData: []
    };
  },
  created() {
    this.getList();
  },
  methods: {
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
      const { deviceModelName } = this.requestForm.params;
      return deviceModelName === "" || deviceModelName === undefined || deviceModelName === null;
    },
    // 查询场所类型
    getListName(data, code) {
      return getName(data, code);
    },

    // 获取列表
    async getList() {
      console.log(this.requestForm);
      const res = await baseService.post("exam/api/deviceModel/listPage", this.requestForm);
      this.requestForm.total = res.data.total;
      this.tableData = res.data.list;
      this.loading = false;
    },
    // 删除列表
    async deleteFn(val) {
      try {
        const res = await baseService.post("exam/api/deviceModel/delete", { id: val.id });
        this.$notify({
          title: "成功",
          message: "删除成功",
          type: "success",
          duration: 2000
        });
        this.getList();
      } catch (error) {
        console.log("删除错误", error);
      }
    },
    // 刷新
    refresh() {
      (this.requestForm = {
        current: 1,
        pageSize: 10,
        total: 0,
        params: {
          deviceModelName: ""
        }
      }),
        (this.loading = true);
      this.getList();
    },

    // 页数改变
    handleCurrentChange(val) {
      this.loading = true;
      this.requestForm.current = val;
      this.requestForm.pageSize = 10;
      this.getList();
    },
    handleSizeChange(val) {
      this.loading = true;
      this.requestForm.pageSize = val;
      this.requestForm.current = 1;
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

