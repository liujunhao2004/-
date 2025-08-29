<template>
  <div>
    <el-card class="box-card">
      <el-form :model="requestForm" label-width="100px">
        <el-row :gutter="20" type="flex" justify="space-between" style="flex-wrap: wrap">
          <el-col :span="8">
            <el-form-item label="场所类型">
              <el-select v-model="requestForm.params.placeType" placeholder="请选择" style="width: 100%">
                <el-option v-for="item in placeTypeData" :key="item.code" :label="item.name" :value="item.code"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="场所名称">
              <el-input v-model="requestForm.params.placeName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="场所联系人">
              <el-input v-model="requestForm.params.contactPerson"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="场所联系电话">
              <el-input v-model="requestForm.params.contactPhone"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="15">
            <el-button type="primary" @click="query">查询</el-button>
            <el-button type="info" @click="refresh">重置</el-button>
            <el-button type="primary" @click="$refs.add.open()">新增</el-button>
            <el-button type="success" @click="chooseFile">导入</el-button>
            <el-button type="warning" @click="downloadTemplate">下载模板</el-button>

            <input ref="upFile" class="file" name="file" type="file" style="display: none" @change="doImport" />
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
            {{ getPlaceName(scope.row.placeType) }}
          </template>
        </el-table-column>

        <el-table-column prop="placeName" align="center" label="场所名称"></el-table-column>
        <el-table-column prop="policeStation" align="center" label="所属派出所"></el-table-column>
        <el-table-column prop="communityPolice" align="center" label="所属社区民警"></el-table-column>
        <el-table-column prop="address" align="center" label="场所地址"></el-table-column>
        <el-table-column prop="contactPerson" align="center" label="场所联系人"></el-table-column>
        <el-table-column prop="contactPhone" align="center" label="场所联系电话"></el-table-column>

        <el-table-column fixed="right" label="操作" width="150" align="center">
          <template v-slot="scope">
            <el-button link type="primary" size="small" @click="$refs.detail.open(scope.row)">详情</el-button>
            <el-button link type="primary" size="small" @click="$refs.updata.open(scope.row)">编辑</el-button>
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

    <el-dialog title="导入提示" v-model="centerDialogVisible" width="40%" center>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="本批次号">
          {{ importData.batchNo }}
        </el-descriptions-item>
        <el-descriptions-item label="成功">{{ importData.successCount }}</el-descriptions-item>
        <el-descriptions-item label="失败">{{ importData.failCount }}</el-descriptions-item>
        <el-descriptions-item label="失败原因">
          <span v-html="formattedFailDetail"></span>
        </el-descriptions-item>
      </el-descriptions>
      <el-table
        :header-cell-style="{
          background: '#f2f3f4',
          color: '#555',
          'font-weight': 'bold',
          'line-height': '32px'
        }"
        border
        :data="importData.detailList"
        style="width: 100%"
      >
        <el-table-column prop="police" label="民警"></el-table-column>
        <el-table-column prop="placeCount" label="场所数量"></el-table-column>
        <el-table-column prop="deviceCount" label="设备数量"></el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="centerDialogVisible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <add ref="add" @refresh="refresh"></add>
    <detail ref="detail" @refresh="refresh"></detail>
    <updata ref="updata" @refresh="refresh"></updata>
  </div>
</template>

<script>
import add from "./commit/add.vue";
import detail from "./commit/details.vue";
import updata from "./commit/updata.vue";
import { placeTypeData } from "@/dictionary/index";
import { getName } from "@/utils/public";
import baseService from "@/service/baseService";

export default {
  components: { add, detail, updata },
  data() {
    return {
      loading: true,
      centerDialogVisible: false,

      requestForm: {
        current: 1,
        pageSize: 10,
        total: 0,

        params: {
          address: "",
          communityPolice: "",
          contactPerson: "",
          contactPhone: "",
          placeType: "",
          address: "",
          policeStation: "",
          placeName: ""
        }
      },
      importData: {
        batchNo: "3fe83cf4-04c9-4805-b93c-b1ccf4b4bf99",
        detailList: [
          {
            deviceCount: 30,
            placeCount: 1,
            police: "朝阳-赵志宏"
          }
        ],
        failCount: 0,
        successCount: 1,
        total: 0
      },

      tableData: [],
      placeTypeData
    };
  },
  computed: {
    formattedFailDetail() {
      var detail = this.importData && this.importData.failDetail;
      return detail ? detail.replace(/\n/g, "<br>") : "";
    }
  },
  created() {
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
      const { placeType, placeName, contactPerson, contactPhone } = this.requestForm.params;
      return (
        (placeType === "" || placeType === undefined || placeType === null) &&
        (placeName === "" || placeName === undefined || placeName === null) &&
        (contactPerson === "" || contactPerson === undefined || contactPerson === null) &&
        (contactPhone === "" || contactPhone === undefined || contactPhone === null)
      );
    },
    centerDialogVisibleFn() {
      this.centerDialogVisible = false;
    },
    // 查询场所类型
    getPlaceName(code) {
      return getName(this.placeTypeData, code);
    },
    // 上传
    chooseFile: function () {
      this.$refs.upFile.dispatchEvent(new MouseEvent("click"));
    },
    // 下载模版
    async downloadTemplate() {
      const blob = await baseService.downloadBlob("exam/api/place/templates");
      if (blob && blob.size === 0) {
        ElMessage.error("内容为空，无法下载");
        return;
      }
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `场所管理模版.xlsx`;
      document.body.appendChild(link);
      link.click();
      window.setTimeout(function () {
        URL.revokeObjectURL(blob);
        document.body.removeChild(link);
      }, 0);
      this.$message({
        message: "下载成功",
        type: "success"
      });
    },
    // 导入场所
    async doImport(e) {
      const file = e.target.files[0];
      if (file) {
        const formdata = new FormData();
        formdata.append("file", file);
        let datas = {
          "Content-Type": "multipart/form-data"
        };
        const res = await baseService.post("exam/api/place/import", formdata, datas);
        this.importData = res.data;
        this.$message({
          message: "数据导入成功！",
          type: "success"
        });
        this.centerDialogVisible = true;
        this.getList();
      }
    },
    // 下载民警图片
    downloadZip(batchNo) {
      // 显示下载中提示

      const loading = this.$loading({
        lock: true,
        text: "文件包下载中，请稍候...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      // imagesAsZip
      //   imagesAsZip({ batchNo: batchNo }).then((response) => {
      //     ElMessage.success("下载完成！");
      //     loading.close();

      //     console.log(response);
      //   });
      // 创建隐藏的下载链接
      // const a = document.createElement('a')
      // a.style.display = 'none'
      // a.href = `${process.env.VUE_APP_BASE_API}/exam/api/place/imagesAsZip?batchNo=${batchNo}`

      // // 添加时间戳防止缓存
      // a.href += `&t=${new Date().getTime()}`

      // // 设置文件名（可选）
      // a.download = `place_images_${batchNo}.zip`

      // document.body.appendChild(a)

      // // 添加加载完成和错误处理
      // a.onload = () => {
      //   loading.close()
      //   ElMessage.success('下载完成！')
      //   document.body.removeChild(a)
      // }

      // a.onerror = () => {
      //   loading.close()
      //   ElMessage.error('下载失败，请重试')
      //   document.body.removeChild(a)
      // }

      // // 触发点击
      // a.click()

      // // 备用方案：5秒后自动关闭加载提示（防止长时间卡住）
      // setTimeout(() => {
      //   if (loading) {
      //     loading.close()
      //   }
      // }, 30000)
    },
    // 获取列表
    async getList() {
      const res = await baseService.post("exam/api/place/list", this.requestForm);
      this.requestForm.total = res.data.total;
      this.tableData = res.data.list;
      this.loading = false;
    },
    // 删除列表
    async deleteFn(val) {
      try {
        const res = await baseService.post("exam/api/place/delete", { id: val.id });
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
          address: "",
          communityPolice: "",
          contactPerson: "",
          contactPhone: "",
          placeType: "",
          address: "",
          policeStation: ""
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
      this.requestForm.pageSize = val;
      this.requestForm.current = 1;
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

