<template>
  <el-dialog title="详情" width="70%" v-model="visible" :before-close="handleClose">
    <el-form ref="form" :model="form" label-position="right" label-width="120px">
      <el-card>
        <el-row :gutter="20" type="flex" justify="space-between" style="flex-wrap: wrap">
          <el-col :span="12">
            <el-form-item label="所属社区民警" prop="policeOfficerId">
              <el-select v-model="form.policeOfficerId" placeholder="请选择" style="width: 100%" disabled>
                <el-option v-for="item in restaurants" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属派出所" prop="policeStation">
              <el-input v-model="form.policeStation" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="场所类型" prop="placeType">
              <el-select v-model="form.placeType" placeholder="请选择" style="width: 100%" disabled>
                <el-option v-for="item in placeTypeData" :key="item.code" :label="item.name" :value="item.code"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="场所名称" prop="placeName">
              <el-input v-model="form.placeName" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="场所地址" prop="address">
              <el-input v-model="form.address" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="场所联系人" prop="contactPerson">
              <el-input v-model="form.contactPerson" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="场所联系电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" disabled />
            </el-form-item>
          </el-col>
        </el-row>
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
import { placeTypeData } from "@/dictionary/index";

export default {
  data() {
    return {
      visible: false,
      placeTypeData,
      restaurants: [],

      form: {
        address: "",
        communityPolice: "",
        contactPerson: "",
        contactPhone: "",
        placeType: "",
        address: "",
        policeStation: "",
        policeOfficerId: ""
      }
    };
  },
  methods: {
    handleClose(done) {
      done();
    },
    // 获取所有民警
    async getAll() {
      try {
        const response = await baseService.post("exam/api/police/queryAllPolice");
        this.restaurants = response.data || [];
      } catch (error) {
        console.error("加载场所数据失败:", error);
        this.restaurants = [];
      }
    },
    open(record) {
      this.getAll();
      this.form = record;
      this.visible = true;
    },
    close() {
      this.visible = false;
    }
  }
};
</script>
