<template>
  <div>
    <el-card style="padding: 10px">
      <el-form :model="form" label-width="120px">
        <el-row>
          <el-col :span="6">
            <el-form-item label="姓名">
              <el-input v-model="form.params.name" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="学校名称">
              <el-input v-model="form.params.schoolName" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="院系名称">
              <el-input v-model="form.params.departmentName" />
            </el-form-item>
          </el-col>

          <el-col :span="6" class="flex-end">
            <el-button type="primary" @click="getList">查询</el-button>
            <!-- <el-button type="success" @click="$refs.detail.open({ type: 'add' })">新增</el-button> -->
            <el-button type="info" @click="refresh">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <el-card style="padding: 10px">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column property="name" label="姓名"> </el-table-column>
        <el-table-column property="type" label="类型">
          <template #default="scope"> 学生 </template>
        </el-table-column>
        <el-table-column label="头像">
          <template #default="scope">
            <el-image style="width: 60px; height: 60px" :src="scope.row.headImage" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column property="schoolName" label="学校名称"> </el-table-column>
        <el-table-column property="departmentName" label="院系名称"> </el-table-column>

        <el-table-column property="grade" label="年级"> </el-table-column>

        <el-table-column property="createTime" label="创建时间" />

        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="$refs.detail.open({ type: 'detail', params: scope.row })"> 详情 </el-button>

            <!-- <el-popconfirm class="box-item" title="确定删除这条数据吗？" placement="top-start" @confirm="confirm(scope.row)">
              <template #reference>
                <el-button link type="danger" size="small"> 删除 </el-button>
              </template>
            </el-popconfirm> -->

            <el-button link type="primary" size="small" @click="$refs.detail.open({ type: 'upData', params: scope.row })"> 编辑 </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination size="small" background layout="prev, pager, next" :total="form.total" class="mt-4" @current-change="handleCurrentChange" />
    </el-card>
    <detail ref="detail" @refresh="refresh" :schoolList="schoolList"></detail>
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
          type: 1,
          name: "",

          departmentName: "",
          schoolName: ""
        },
        total: 100,
        pageSize: 10,
        current: 1
      },

      schoolList: [],
      tableData: []
    };
  },
  async created() {
    await this.getList();
    // await this.getDepartmentList();
    await this.getSchoolList();
  },
  methods: {
    // // 获取名称
    getName(list, id) {
      const item = list.find((item) => item.id === id);
      return item ? item.name : null;
    },

    // // 获取学校数据
    getSchoolList() {
      baseService.post("/school/list", {}).then((res) => {
        const data = res.data;

        this.schoolList = data.map((item) => ({
          id: item.id,
          name: item.name
        }));
      });
    },

    // 获取列表
    getList() {
      baseService.post("/userInfo/pageList", this.form).then((res) => {
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
          type: 1,
          name: "",
          departmentName: "",
          schoolName: ""
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
      baseService.delete(`/userInfo/delete/${val.id}`).then((res) => {
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