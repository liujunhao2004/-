<template>
  <div>
    <el-card class="box-card">
      <el-form :model="requestForm" label-width="100px">
        <el-row :gutter="20" type="flex" justify="space-between" style="flex-wrap: wrap">
          <el-col :span="6">
            <el-form-item label="所属派出所">
              <el-input v-model="requestForm.params.policeStation"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="所属社区民警">
              <el-input v-model="requestForm.params.communityPolice"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="场所类型">
              <el-select v-model="requestForm.params.placeType" placeholder="请选择" style="width: 100%">
                <el-option v-for="item in placeTypeData" :key="item.code" :label="item.name" :value="item.code"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="场所名称">
              <el-input v-model="requestForm.params.placeName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="批次号">
              <el-input v-model="requestForm.params.batchNo"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="绑定状态">
              <el-select v-model="requestForm.params.bindingStatus" placeholder="请选择" style="width: 100%">
                <el-option v-for="item in bindingStatusData" :key="item.code" :label="item.name" :value="item.code"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <!-- <el-form-item label="设备绑定人员">
                <el-input v-model="requestForm.params.bindingPerson"></el-input>
              </el-form-item> -->
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
        <el-table-column prop="placeType" align="center" label="场所类型">
          <template v-slot="scope">
            {{ getListName(placeTypeData, scope.row.placeType) }}
          </template>
        </el-table-column>
        <el-table-column prop="placeName" align="center" label="场所名称" width="200"></el-table-column>

        <el-table-column prop="policeStation" width="130" align="center" label="所属派出所"></el-table-column>
        <el-table-column prop="communityPolice" align="center" width="150" label="所属社区民警"></el-table-column>
        <el-table-column prop="address" align="center" width="150" label="场所地址"></el-table-column>
        <el-table-column prop="contactPerson" width="130" align="center" label="场所联系人"></el-table-column>
        <el-table-column prop="contactPhone" align="center" width="150" label="场所联系电话"></el-table-column>
        <el-table-column prop="deviceModelId" width="150" label="设备型号" align="center">
          <template v-slot="scope">
            {{ getListName(deviceModelList, scope.row.deviceModelId) }}
          </template>
        </el-table-column>
        <el-table-column prop="bindingStatus" width="150" label="设备绑定状态" align="center">
          <template v-slot="scope">
            {{ getListName(bindingStatusData, scope.row.bindingStatus) }}
          </template>
        </el-table-column>
        <el-table-column prop="deviceQrcodesCount" label="绑定数量" align="center"></el-table-column>
        <el-table-column prop="batchNo" align="center" label="批次号" width="180"></el-table-column>
        <el-table-column prop="createTime" align="center" width="150" label="创建时间"></el-table-column>
        <el-table-column fixed="right" label="操作" width="200" align="center">
          <template v-slot="scope">
            <el-popconfirm class="box-item" title="这是一条数据确定解绑吗？" placement="top-start" @confirm="Unbind(scope.row)" v-if="scope.row.bindingStatus != 0">
              <template #reference>
                <el-button link type="danger" size="small"> 解绑 </el-button>
              </template>
            </el-popconfirm>
            <el-button link type="primary" size="small" @click="$refs.add.open({ type: 'detail', params: scope.row })">详情</el-button>
            <el-popconfirm class="box-item" title="确定删除这条数据吗？" placement="top-start" @confirm="deleteFn(scope.row)">
              <template #reference>
                <el-button link type="danger" size="small"> 删除 </el-button>
              </template>
            </el-popconfirm>
            <el-button link type="primary" size="small" @click="$refs.add.open({ type: 'updata', params: scope.row })">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="requestForm.current" :page-sizes="[10, 20, 30, 40]" :page-size="requestForm.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="requestForm.total"> </el-pagination>
    </el-card>

    <add ref="add" @refresh="refresh" :deviceModelList="deviceModelList"></add>
  </div>
</template>

<script>
import add from "./commit/add.vue";

import baseService from "@/service/baseService";
import { placeTypeData, bindingStatusData } from "@/dictionary/index";
import { getName } from "@/utils/public";

export default {
  components: { add },
  data() {
    return {
      requestForm: {
        current: 1,
        pageSize: 10,
        total: 0,
        params: {
          policeStation: "",
          communityPolice: "",
          placeType: "",
          batchNo: "",
          placeName: "",
          // deviceModel: '',
          bindingStatus: ""
          // bindingPerson: ''
        }
      },
      loading: true,
      tableData: [],
      placeTypeData,
      bindingStatusData,
      deviceModelList: []
    };
  },
  created() {
    this.getDeviceModelList();
    this.getList();

    console.log(this.placeTypeData);
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
      const { policeStation, communityPolice, placeType, placeName, batchNo, bindingStatus } = this.requestForm.params;
      return (
        (placeType === "" || placeType === undefined || placeType === null) &&
        (placeName === "" || placeName === undefined || placeName === null) &&
        (policeStation === "" || policeStation === undefined || policeStation === null) &&
        (communityPolice === "" || communityPolice === undefined || communityPolice === null) &&
        (batchNo === "" || batchNo === undefined || batchNo === null) &&
        (bindingStatus === "" || bindingStatus === undefined || bindingStatus === null)
      );
    },
    // 解绑
    async Unbind(val) {
      try {
        await baseService.post("exam/api/device/unbind", { id: val.id });
        this.$notify({
          message: "解绑成功",
          type: "success",
          duration: 2000
        });
        this.getList();
      } catch (error) {
        console.log("解绑错误", error);
      }
    },
    // 查询场所类型
    getListName(data, code) {
      return getName(data, code);
    },
    // 上传
    chooseFile: function () {
      this.$refs.upFile.dispatchEvent(new MouseEvent("click"));
    },
    // 下载模版
    downloadTemplate() {
      const a = document.createElement("a");
      a.href = process.env.VUE_APP_BASE_API + "/exam/api/place/templates";
      a.download = "place"; // 默认文件名
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },

    // 获取列表
    async getList() {
      const res = await baseService.post("exam/api/device/pageList", this.requestForm);
      this.requestForm.total = res.data.total;
      this.tableData = res.data.list;
      this.loading = false;
    },
    // 获取设备型号
    async getDeviceModelList() {
      let res = await baseService.post("exam/api/deviceModel/list");
      this.deviceModelList = res.data.map((item) => ({
        code: item.id,
        name: item.deviceModelName
      }));
    },

    // 删除列表
    async deleteFn(val) {
      try {
        await baseService.post("exam/api/device/delete", { id: val.id });
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
          policeStation: "",
          communityPolice: "",
          placeType: "",
          placeName: "",
          // deviceModel: '',
          batchNo: "",

          bindingStatus: ""
          // bindingPerson: ''
        }
      }),
        (this.loading = true);
      this.getList();
    },

    // 页数改变
    handleCurrentChange(val) {
      this.requestForm.current = val;
      this.requestForm.pageSize = 10;
      this.getList();
      this.loading = true;
    },
    handleSizeChange(val) {
      this.requestForm.current = 1;
      this.requestForm.pageSize = val;
      this.getList();
      this.loading = true;
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

