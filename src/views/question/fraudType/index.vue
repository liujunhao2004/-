<template>
  <div>
    <el-card>
      <el-form label-width="120px" :model="requestForm">
        <el-row :gutter="20" type="flex" justify="space-between">
          <el-col :span="8">
            <el-form-item label="宣传类型">
              <el-input v-model="requestForm.params.tagDesc"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="query">查询</el-button>
            <el-button type="info" @click="refresh()">重置</el-button>
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
        :header-cell-style="{
          background: '#f2f3f4',
          color: '#555',
          'font-weight': 'bold',
          'line-height': '32px'
        }"
        v-loading="loading"
      >
        <el-table-column prop="tagDesc" label="宣传类型"></el-table-column>
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
        <el-table-column prop="createTime" label="诈骗类型">
          <template #default="scope">
            <el-tag class="m-r-10" v-for="(item, index) in scope.row.childrenScamTagList" :key="index" :disable-transitions="false">
              {{ item.tagDesc }}
            </el-tag>
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
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="requestForm.current" :page-sizes="[10, 20, 30, 40]" :page-size="requestForm.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="requestForm.total"> </el-pagination>
    </el-card>

    <detail ref="detail" @refresh="refresh"></detail>
  </div>
</template>

<script>
import detail from "./details.vue";
import baseService from "@/service/baseService";
export default {
  components: { detail },
  data() {
    return {
      // fraudType,
      loading: true,
      requestForm: {
        current: 1,
        pageSize: 10,
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
        console.log("删除错误：", error);
      }
    },
    // 刷新
    refresh() {
      (this.requestForm = {
        current: 1,
        pageSize: 10,
        total: 0,
        params: {
          tagDesc: ""
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
    // 修改每页条数
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
  margin-top: 10px;
}

.m-r-10 {
  margin-right: 10px;
}
</style>

