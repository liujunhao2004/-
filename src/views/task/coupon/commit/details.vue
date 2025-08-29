details<template>
  <el-dialog title="详情" width="70%" v-model="visible" :before-close="handleClose">
    <el-form ref="form" :model="form" label-position="right" label-width="120px">
      <el-card>
        <el-form-item label="优惠券标题" prop="name">
          <el-input v-model="form.batchNo" disabled />
        </el-form-item>
        <el-form-item label="优惠券标题" prop="name">
          <el-input v-model="form.couponTitle" disabled />
        </el-form-item>
        <el-form-item label="优惠券描述" prop="description">
          <el-input v-model="form.couponDesc" disabled />
        </el-form-item>
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
        >
          <el-table-column prop="code" label="优惠劵" align="center"></el-table-column>
          <el-table-column prop="createTime" label="创建时间" align="center"></el-table-column>
          <el-table-column prop="status" label="状态" align="center">
            <template v-slot="scope">
              {{ scope.row.status == 1 ? "已领取" : "未领取" }}
            </template>
          </el-table-column>
        </el-table>

        <el-pagination :hide-on-single-page="false" @current-change="handleCurrentChange" background layout=" prev, pager, next, jumper" :page-size="requestForm.pageSize" :total="requestForm.total"></el-pagination>
      </el-card>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="info" @click="close">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script>
import baseService from "@/service/baseService";
export default {
  data() {
    return {
      visible: false,
      requestForm: {
        current: 1,
        pageSize: 10,
        total: 0,
        params: {
          batchId: ""
        }
      },
      form: {
        batchNo: "",
        couponTitle: "",
        couponDesc: ""
      },
      loading: true,
      tableData: null
    };
  },
  methods: {
    handleClose(done) {
      done();
    },
    async getList() {
      const res = await baseService.post("exam/api/coupon/couponPage", this.requestForm);
      this.requestForm.total = res.data.total;
      this.tableData = res.data.list;
      this.loading = false;
    },
    // 页数改变
    handleCurrentChange(val) {
      this.requestForm.current = val;
      this.requestForm.pageSize = 10;
      this.loading = true;

      this.getList();
    },
    // 打开弹框
    open(record) {
      // 只提取需要的字段
      const { batchNo, couponTitle, couponDesc } = record;

      // 赋值给 form 对象
      this.form = {
        batchNo,
        couponTitle,
        couponDesc
      };
      this.requestForm.params.batchId = record.id;

      this.getList();

      this.visible = true;
    },
    close() {
      this.visible = false;
    }
  }
};
</script>
<style scoped>
.centered-input /deep/ .el-input__inner {
  text-align: center;
}
</style>