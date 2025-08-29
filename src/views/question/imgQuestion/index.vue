<template>
  <div>
    <el-card class="box-card">
      <el-form label-width="80px" :model="requestForm">
        <el-row :gutter="20" type="flex" justify="space-between">
          <el-col :span="6">
            <el-form-item label="宣传类型">
              <el-select v-model="requestForm.params.tagId" placeholder="请选择" style="width: 100%">
                <el-option v-for="item in tagList" :key="item.id" :label="item.tagDesc" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="题目内容">
              <el-input v-model="requestForm.params.title"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-button type="primary" @click="query()">查询</el-button>
            <el-button type="info" @click="refreshs">重置</el-button>
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
        <el-table-column prop="questionType" label="宣传类型" width="100">
          <template v-slot="scope">
            {{ getDictionary(tagList, scope.row.tagId, "id", "tagDesc") }}
          </template>
        </el-table-column>

        <el-table-column label="题目内容" prop="title"> </el-table-column>

        <el-table-column prop="createTime" label="创建时间"></el-table-column>

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

    <detail ref="detail" @refresh="refresh" :tagList="tagList"></detail>
  </div>
</template>

<script>
import detail from "./details.vue";

import baseService from "@/service/baseService";
import { questionType } from "@/dictionary/index";

export default {
  components: { detail },
  data() {
    return {
      questionType,
      tagList: [],
      loading: true,
      requestForm: {
        current: 1,
        pageSize: 10,
        total: 0,
        params: {
          title: "",

          tagId: ""
        }
      },
      importVisible: false,
      tableData: []
    };
  },

  async created() {
    await this.getTagList();
    await this.getList();
  },
  methods: {
    // 查询
    query() {
      this.getList();
      this.loading = true;
      this.$notify({
        title: "查询成功",
        type: "success",
        duration: 2000
      });
    },
    // 获取反诈类型
    async getTagList() {
      const res = await baseService.post("exam/api/tag/listPage", { current: 1, size: 1000 });
      this.tagList = res.data.list;
    },
    // 获取文本
    getDictionary(list, code, key, name) {
      const item = list.find((item) => item[key] === code);

      return item ? item[name] : "";
    },
    // 获取列表
    async getList() {
      const res = await baseService.post("exam/api/poster/list", this.requestForm);
      this.requestForm.total = res.data.total;
      this.tableData = res.data.list;
      this.loading = false;
    },
    // 删除
    async deleteFn(val) {
      try {
        await baseService.post("exam/api/poster/delete", { id: val.id });
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
          title: "",

          tagId: ""
        }
      }),
        (this.loading = true);
      this.getList();
    },
    // 重置
    refreshs() {
      this.$notify({
        title: "重置成功",
        type: "success",
        duration: 2000
      });
      this.loading = true;
      this.refresh();
    },

    // 页数改变
    handleCurrentChange(val) {
      this.requestForm.current = val;
      this.requestForm.pageSize = 10;
      this.loading = true;
      this.getList();
      console.log(val, "页数改变");
    },
    // 修改条数
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
  margin-top: 10px;
}
.m-l-r-10 {
  margin: 0 10px;
}
.texts {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

