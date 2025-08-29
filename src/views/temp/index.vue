<template>
  <div>
    <el-card>
      <el-form label-width="120px" :model="requestForm">
        <el-row :gutter="20" type="flex" justify="space-between">
          <el-col :span="5">
            <el-form-item label="诈骗类型描述">
              <el-input v-model="requestForm.params.tagDesc"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="19">
            <el-button type="primary" @click="query">查询</el-button>
            <el-button type="info" @click="refresh">重置</el-button>
            <el-button type="primary" @click="$refs.add.open()">新增</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <el-card class="box-card">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{
          background: '#f2f3f4',
          color: '#555',
          'font-weight': 'bold',
          'line-height': '32px'
        }"
        v-loading="loading"
      >
        <el-table-column prop="tagDesc" label="诈骗类型描述"></el-table-column>
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template v-slot="scope">
            <el-button type="info" icon="Message" circle @click="$refs.detail.open(scope.row)" />
            <el-button type="primary" icon="Edit" circle @click="$refs.upData.open(scope.row)" />
            <el-popconfirm class="box-item" title="确定删除这条数据吗？" placement="top-start" @confirm="deleteFn(scope.row)">
              <template #reference>
                <el-button type="danger" icon="Delete" circle />
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="requestForm.current" :page-sizes="[10, 20, 30, 40]" :page-size="requestForm.size" layout="total, sizes, prev, pager, next, jumper" :total="requestForm.total"> </el-pagination>
    </el-card>

    <add ref="add" @refresh="refresh"></add>
    <detail ref="detail" @refresh="refresh"></detail>
    <upData ref="upData" @refresh="refresh"></upData>
  </div>
</template>

<script>
import add from "./commit/add.vue";
import detail from "./commit/details.vue";
import upData from "./commit/updata.vue";
import baseService from "@/service/baseService";
export default {
  components: { add, detail, upData },
  data() {
    return {
      // fraudType,
      loading: true,
      requestForm: {
        current: 1,
        size: 10,
        total: 0,
        params: {
          tagDesc: ""
        }
      },
      importVisible: false,
      tableData: []
    };
  },
  created() {
    this.getList();
  },
  methods: {
    query() {
      if (this.requestForm.params.tagDesc == "" || this.requestForm.params.tagDesc == undefined) {
        return this.$message({
          message: "请输入搜索信息哦",
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
    async getList() {
      const res = await baseService.post("exam/api/tag/listPage", this.requestForm);
      this.requestForm.total = res.data.total;
      this.tableData = res.data.list;
      this.loading = false;
    },
    async deleteFn(val) {
      try {
        await baseService.post("exam/api/tag/delete", { id: val.id });
        this.$notify({
          title: "删除成功",
          type: "success",
          duration: 2000
        });
        this.getList();
        this.loading = true;
      } catch (error) {
        this.$message({
          message: "删除失败，请联系工作人员",
          type: "warning"
        });
        console.log("删除错误：", error);
      }
    },
    // 刷新
    refresh() {
      (this.requestForm = {
        current: 1,
        size: 10,
        total: 0,
        params: {
          title: ""
        }
      }),
        this.$notify({
          title: "重置成功",
          type: "success"
        });
      this.loading = true;

      this.getList();
    },

    // 页数改变
    handleCurrentChange(val) {
      this.requestForm.current = val;
      this.requestForm.size = 10;
      this.getList();
    },
    handleSizeChange(val) {
      this.requestForm.current = 1;
      this.requestForm.size = val;
      this.getList();
    }
  }
};
</script>
<style scoped>
.box-card {
  margin-top: 10px;
}
.m-l-r-10 {
  margin: 0 10px;
}
</style>

