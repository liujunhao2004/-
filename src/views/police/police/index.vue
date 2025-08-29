<template>
  <div>
    <el-card class="box-card">
      <el-form :model="requestForm" label-width="100px">
        <el-row :gutter="20" type="flex" justify="space-between" style="flex-wrap: wrap">
          <el-col :span="8">
            <el-form-item label="所属单位">
              <el-select v-model="requestForm.params.policeStationId" placeholder="请选择">
                <el-option v-for="item in policeStationList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="警员姓名">
              <el-input v-model="requestForm.params.name" placeholder="请输入警员姓名" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-button type="primary" @click="query">查询</el-button>
            <el-button type="info" @click="refresh">重置</el-button>
            <el-button type="primary" @click="$refs.detail.open({ type: 'add' })">新增</el-button>
            <input ref="upFile" class="file" name="file" type="file" style="display: none" @change="doImport" />
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
        <el-table-column prop="name" label="姓名" align="center"></el-table-column>

        <el-table-column prop="policeNo" label="警号" align="center"></el-table-column>
        <el-table-column prop="position" label="职务" align="center"></el-table-column>
        <el-table-column prop="mobile" label="民警电话" align="center"></el-table-column>
        <el-table-column prop="unitName" label="所属单位" align="center"></el-table-column>
        <el-table-column label="民警图片" align="center">
          <template #default="{ row }">
            <el-image :src="row.photoUrl" :preview-teleported="true" :preview-src-list="[row.photoUrl]" style="width: 60px; height: 60px; cursor: zoom-in" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="250" align="center">
          <template v-slot="scope">
            <el-button link type="primary" size="small" @click="$refs.detail.open({ type: 'detail', params: scope.row })"> 详情 </el-button>

            <el-popconfirm class="box-item" title="确定删除这条数据吗？" placement="top-start" @confirm="deleteFn(scope.row)">
              <template #reference>
                <el-button link type="danger" size="small"> 删除 </el-button>
              </template>
            </el-popconfirm>

            <el-button link type="primary" size="small" @click="$refs.detail.open({ type: 'upData', params: scope.row })"> 编辑 </el-button>

            <!-- 
            <el-button type="info" icon="View" circle @click="$refs.detail.open(scope.row)" />
            <el-button type="primary" icon="Edit" circle @click="$refs.updata.open(scope.row)" />
            <el-popconfirm class="box-item" title="确定删除这条数据吗？" placement="top-start" @confirm="deleteFn(scope.row)">
              <template #reference>
                <el-button type="danger" icon="Delete" circle />
              </template>
            </el-popconfirm> -->

            <el-popover :visible="scope.row.visible" :width="180" placement="left-start">
              <el-input v-model="downloadInput" placeholder="请输入下载数量"></el-input>
              <div style="text-align: right; margin: 0">
                <el-button type="primary" style="margin-top: 10px" size="small" @click="godown(scope.row)">确定</el-button>
              </div>
              <template #reference>
                <el-button link type="success" size="small" @click="scope.row.visible = true"> 下载 </el-button>

                <!-- <el-button type="success" icon="Download" circle @click="scope.row.visible = true" /> -->
              </template>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="requestForm.current" :page-sizes="[10, 20, 30, 40]" :page-size="requestForm.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="requestForm.total"> </el-pagination>
    </el-card>

    <!-- <add ref="add" @refresh="refresh"></add>
    <updata ref="updata" @refresh="refresh"></updata>
    <detail ref="detail" @refresh="refresh"></detail> -->
    <detail ref="detail" @refresh="refresh" :policeStationList="policeStationList"></detail>
  </div>
</template>

<script>
// import add from "./commit/add.vue";
// import detail from "./commit/detail.vue";
// import updata from "./commit/updata.vue";
import detail from "./details.vue";

import baseService from "@/service/baseService";

export default {
  components: {
    // add,
    // updata,
    detail
  },
  data() {
    return {
      requestForm: {
        current: 1,
        pageSize: 10,
        total: 0,
        params: {
          policeStationId: "",
          name: ""
        }
      },
      policeStationList: [],
      /* 其他字段 */
      showPopover: false, // 控制每行的 Popover 显示
      downloadInput: "", // 存储每行的输入内容
      importVisible: false,
      tableData: [],
      loading: true
    };
  },
  created() {
    this.getList();
    this.getPoliceStationList();
  },
  methods: {
    // 获取派出所列表
    getPoliceStationList() {
      baseService.post("/policeStation/list", {}).then((res) => {
        console.log(res);
        this.policeStationList = res.data.map((item) => ({
          id: item.id,
          name: item.name
        }));
      });
    },
    // isParamsAllEmpty() {
    //   const { policeNo, name } = this.requestForm.params;
    //   return (policeNo === "" || policeNo === undefined || policeNo === null) && (name === "" || name === undefined || name === null);
    // },
    query() {
      // if (this.isParamsAllEmpty()) {
      //   return this.$message({
      //     message: "请至少输入一个查询信息！",
      //     type: "warning"
      //   });
      // }
      this.loading = true;

      this.getList();
      this.$notify({
        title: "查询成功",
        type: "success",
        duration: 2000
      });
    },
    async godown(val) {
      if (!this.downloadInput) {
        val.visible = false;
        return this.$message({
          message: "请输入下载量",
          type: "warning"
        });
      }
      const loading = this.$loading({
        lock: true,
        text: "文件包下载中，请稍候...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      const blob = await baseService.downloadBlob("/exam/api/police/downloadPoliceVRCode", { policeId: val.id, number: this.downloadInput, name: val.name });
      if (blob && blob.size === 0) {
        ElMessage.error("内容为空，无法下载");
        return;
      }
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${val.name}.zip`;
      document.body.appendChild(link);
      link.click();
      window.setTimeout(function () {
        // @ts-ignore
        URL.revokeObjectURL(blob);
        document.body.removeChild(link);
        loading.close();
      }, 0);
      this.$message({
        message: "下载成功",
        type: "success"
      });
      val.visible = false;
      loading.close();
    },
    // handleDownload(row) {
    //   if (!row.downloadInput.trim()) {
    //     this.$message.warning("请输入下载内容！");
    //     return;
    //   }
    //   this.$message.success(`开始下载：${row.downloadInput}`);
    //   row.showPopover = false; // 关闭 Popover

    //   // 实际下载逻辑（例如调用接口或 window.open）
    //   // window.open(row.downloadInput);
    // },
    // chooseFile: function () {
    //   this.$refs.upFile.dispatchEvent(new MouseEvent("click"));
    // },
    // 导入
    // async doImport(e) {
    //   const file = e.target.files[0];
    //   const res = await baseService.post("exam/api/qu/qu/import", file);
    //   if (res.code !== 0) {
    //     this.$alert(res.data.msg, "导入信息", {
    //       dangerouslyUseHTMLString: true
    //     });
    //   } else {
    //     this.$message({
    //       message: "数据导入成功！",
    //       type: "success"
    //     });
    //     this.importVisible = false;
    //     this.$refs.pagingTable.getList();
    //   }
    // },
    async getList() {
      const res = await baseService.post("exam/api/police/paging", this.requestForm);
      this.requestForm.total = res.data.total;
      res.data.list.map((item) => (item.visible = false));
      this.tableData = res.data.list;
      this.loading = false;
    },
    async deleteFn(val) {
      try {
        const res = await baseService.post("exam/api/police/delete", { id: val.id });
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
          policeNo: "",
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

  /* padding: 20px; */
}
.m-l-r-10 {
  margin: 0 10px;
}
</style>

