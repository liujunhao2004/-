<template>
  <div>
    <el-card class="box-card">
      <el-form :model="requestForm" label-width="100px">
        <el-row :gutter="20" type="flex" justify="space-between" style="flex-wrap: wrap">
          <el-col :span="8">
            <el-form-item label="批次号">
              <el-input v-model="requestForm.params.batchNo" placeholder="请输入批次号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="优惠券标题">
              <el-input v-model="requestForm.params.couponTitle" placeholder="请输入优惠券标题" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-button type="primary" @click="query">查询</el-button>
            <el-button type="info" @click="refresh">重置</el-button>
            <el-button type="success" @click="chooseFile">导入</el-button>
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
        <el-table-column prop="batchNo" label="批次号" align="center" width="180"></el-table-column>
        <el-table-column prop="couponTitle" label="优惠券标题" align="center" width="150"></el-table-column>
        <el-table-column prop="couponDesc" label="描述" align="center" width="300"></el-table-column>
        <el-table-column prop="quantity" label="数量" align="center" width="60"></el-table-column>

        <el-table-column prop="redeemStartTime" label="开始时间" align="center" width="160"></el-table-column>
        <el-table-column prop="redeemEndTime" label="结束时间" align="center" width="160"></el-table-column>
        <el-table-column prop="redeemPlatform" label="可兑换平台" align="center" width="170"></el-table-column>
        <el-table-column prop="convertibleUser" label="可兑换用户" align="center" width="100"></el-table-column>
        <el-table-column prop="convertibleCount" label="可兑换次数" align="center" width="100"></el-table-column>
        <el-table-column prop="creator" label="创建人" align="center" width="80"></el-table-column>
        <el-table-column prop="batchCreateTime" label="创建时间" align="center" width="160"></el-table-column>
        <el-table-column prop="couponType" label="优惠券类型" align="center" width="150"></el-table-column>
        <el-table-column prop="couponTitle" label="优惠券标题" align="center" width="150"></el-table-column>
        <el-table-column prop="couponAmount" label="优惠券金额" align="center" width="150"></el-table-column>
        <el-table-column prop="minUseAmount" label="启用金额" align="center" width="150"></el-table-column>
        <el-table-column prop="validStartTime" label="有效期开始时间" align="center" width="150"></el-table-column>
        <el-table-column prop="validEndTime" label="有效期结束时间" align="center" width="150"></el-table-column>
        <el-table-column prop="usePlatform" label="可用平台" align="center" width="150"></el-table-column>
        <el-table-column prop="noDateLimit" label="使用日期" align="center" width="150"></el-table-column>
        <el-table-column prop="noMerchantLimit" label="可用商家" align="center" width="150"></el-table-column>
        <el-table-column fixed="right" label="操作" width="80" align="center">
          <template v-slot="scope">
            <el-button link type="primary" size="small" @click="$refs.detail.open(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="requestForm.current" :page-sizes="[10, 20, 30, 40]" :page-size="requestForm.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="requestForm.total"> </el-pagination>
    </el-card>

    <detail ref="detail" @refresh="refresh"></detail>
  </div>
</template>

<script>
import { couponStatus } from "@/dictionary/index";
import { getName } from "@/utils/public";
import baseService from "@/service/baseService";
// import { couponPaging, batchImport, couponBatchPage } from '@/api/antiFraud/antiFraud'
import detail from "./commit/details.vue";

export default {
  components: {
    detail
  },
  data() {
    return {
      requestForm: {
        current: 1,
        pageSize: 10,
        total: 0,
        params: {
          batchNo: "",
          couponTitle: ""
        }
      },
      importVisible: false,
      tableData: [],
      loading: true,
      couponStatus
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
      const { batchNo, couponTitle } = this.requestForm.params;
      return (batchNo === "" || batchNo === undefined || batchNo === null) && (couponTitle === "" || couponTitle === undefined || couponTitle === null);
    },
    // 查询场所类型
    getCouponName(list, code) {
      console.log(code);
      return getName(list, code);
    },
    chooseFile: function () {
      this.$refs.upFile.dispatchEvent(new MouseEvent("click"));
    },
    // 导入
    async doImport(e) {
      const file = e.target.files[0];

      if (file) {
        const formdata = new FormData();
        formdata.append("file", file);
        let datas = {
          "Content-Type": "multipart/form-data"
        };
        const res = await baseService.post("exam/api/coupon/batchImport", formdata, datas);
        this.$message({
          message: "数据导入成功！",
          type: "success"
        });

        this.importVisible = false;
        this.getList();
      }
    },
    async getList() {
      const res = await baseService.post("exam/api/coupon/couponBatchPage", this.requestForm);
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
          batchNo: "",
          couponTitle: ""
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

