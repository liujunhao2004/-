<template>
  <div>
    <el-card style="padding: 10px">
      <el-form :model="form" label-width="120px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="派出所名称">
              <el-input v-model="form.params.name" />
            </el-form-item>
          </el-col>

          <el-col :span="6" class="flex-end">
            <el-button type="primary" @click="getList">查询</el-button>
            <el-button type="success" @click="$refs.detail.open({ type: 'add' })">新增</el-button>
            <el-button type="info" @click="refresh">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <el-card style="padding: 10px">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column property="name" label="派出所名称"> </el-table-column>
        <el-table-column property="mobile" label="派出所电话"> </el-table-column>
        <el-table-column property="address" label="派出所地址"> </el-table-column>

        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="$refs.detail.open({ type: 'detail', params: scope.row })"> 详情 </el-button>

            <el-popconfirm class="box-item" title="确定删除这条数据吗？" placement="top-start" @confirm="confirm(scope.row)">
              <template #reference>
                <el-button link type="danger" size="small"> 删除 </el-button>
              </template>
            </el-popconfirm>

            <el-button link type="primary" size="small" @click="$refs.detail.open({ type: 'upData', params: scope.row })"> 编辑 </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination size="small" background layout="prev, pager, next" :total="form.total" class="mt-4" @current-change="handleCurrentChange" />
    </el-card>
    <detail ref="detail" @refresh="refresh" :policeList="policeList"></detail>
  </div>
</template>
<script>
import detail from "./details.vue";
import { ElMessage } from "element-plus";

import baseService from "@/service/baseService";
export default {
  components: { detail },

  data() {
    return {
      form: {
        params: {
          name: ""
        },
        total: 100,
        pageSize: 10,
        current: 1
      },
      policeList: [],
      tableData: []
    };
  },
  created() {
    this.getList();
    // this.getPoliceList();
  },
  methods: {
    // // 获取名称
    getName(id) {
      const item = this.policeList.find((item) => item.id === id);
      return item ? item.name : null;
    },
    // // 获取民警数据
    // getPoliceList() {
    //   baseService.post("/exam/api/police/queryAllPolice", {}).then((res) => {
    //     const data = res.data;

    //     this.policeList = data.map((item) => ({
    //       id: item.id,
    //       name: item.name,
    //       unitName: item.unitName
    //     }));
    //   });
    // },

    // 获取列表
    getList() {
      baseService.post("/policeStation/pageList", this.form).then((res) => {
        const { total, list } = res.data;
        console.log(total, list);
        this.form.total = total;
        this.tableData = list;
      });
    },
    // 重置
    refresh() {
      this.form = {
        params: {
          name: ""
        },
        total: 100,
        pageSize: 10,
        current: 1
      };
      this.getList();
    },
    // 分页
    handleCurrentChange(val) {
      this.form.current = val;
      this.getList();
    },
    // 删除
    confirm(val) {
      baseService.delete(`/policeStation/delete/${val.id}`).then((res) => {
        if (res.code === 0) {
          ElMessage.success("删除成功");
          this.getList();
        } else {
          ElMessage.error(res.msg);
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.flex-end {
  display: flex;
  justify-content: flex-end;
}
</style>