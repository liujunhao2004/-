<template>
  <div>
    <el-card class="box-card">
      <el-form :model="requestForm" label-width="100px">
        <el-row :gutter="20" type="flex" justify="space-between" style="flex-wrap: wrap">
          <el-col :span="8">
            <el-form-item label="用户">
              <el-input v-model="requestForm.params.userId" placeholder="请输入兑换码" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-button type="primary" @click="query">查询</el-button>
            <el-button type="info" @click="refresh">重置</el-button>
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
        <el-table-column prop="userId" label="用户id" align="center"></el-table-column>
        <el-table-column prop="userName" label="姓名" align="center"></el-table-column>
        <el-table-column prop="schoolName" label="学校" align="center"></el-table-column>
        <el-table-column prop="departmentName" label="院系" align="center"></el-table-column>

        <el-table-column prop="grade" label="年级" align="center"></el-table-column>
        <el-table-column prop="score" label="分数" align="center"></el-table-column>
        <el-table-column prop="accuracy" label="正确率" align="center"></el-table-column>

        <el-table-column prop="code" label="兑换码" align="center"></el-table-column>
        <el-table-column prop="policeName" label="民警" align="center"></el-table-column>
        <!-- <el-table-column prop="placeName" label="场所" align="center">
          <template v-slot="scope">
            <span>{{ scope.row.placeName || "暂无场所" }}</span>
          </template>
        </el-table-column> -->
        <el-table-column prop="createTime" label="答题时间" align="center"></el-table-column>
        <el-table-column prop="questionCount" label="答题题数" align="center"></el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="requestForm.current" :page-sizes="[10, 20, 30, 40]" :page-size="requestForm.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="requestForm.total"> </el-pagination>
    </el-card>
  </div>
</template>

<script>
import baseService from "@/service/baseService";
export default {
  data() {
    return {
      requestForm: {
        current: 1,
        pageSize: 10,
        total: 0,
        params: {
          userId: ""
        }
      },
      loading: true,
      importVisible: false,
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
      const { userId } = this.requestForm.params;
      return userId === "" || userId === undefined || userId === null;
    },
    async getList() {
      const res = await baseService.post("exam/api/answer/record/listPage", this.requestForm);
      this.requestForm.total = res.data.total;
      this.tableData = res.data.list;
      this.loading = false;
    },

    // 刷新
    refresh() {
      (this.requestForm = {
        current: 1,
        pageSize: 10,
        total: 0,
        params: {
          userId: ""
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

  /* padding: 20px; */
}
.m-l-r-10 {
  margin: 0 10px;
}
</style>

