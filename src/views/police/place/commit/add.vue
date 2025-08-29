<template>
  <el-dialog title="新增" width="70%" v-model="visible" :before-close="handleClose">
    <el-form ref="form" :model="form" :rules="rules" label-position="right" label-width="120px">
      <el-card>
        <el-row :gutter="20" type="flex" justify="space-between" style="flex-wrap: wrap">
          <el-col :span="12">
            <el-form-item label="所属社区民警" prop="policeOfficerId">
              <el-select v-model="form.policeOfficerId" placeholder="请选择" style="width: 100%" @change="selectChange">
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
              <el-select v-model="form.placeType" placeholder="请选择" style="width: 100%">
                <el-option v-for="item in placeTypeData" :key="item.code" :label="item.name" :value="item.code"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="场所名称" prop="placeName">
              <el-input v-model="form.placeName" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="场所地址" prop="address">
              <el-input v-model="form.address" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="场所联系人" prop="contactPerson">
              <el-input v-model="form.contactPerson" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="场所联系电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="info" @click="close('form')">关闭</el-button>

        <el-button type="primary" @click="submitForm('form')">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script>
import { placeTypeData } from "@/dictionary/index";
import { validatePhone } from "@/utils/public";
import baseService from "@/service/baseService";
export default {
  data() {
    return {
      visible: false,
      placeTypeData,
      restaurants: [],
      form: this.formdata(),
      rules: {
        placeType: [{ required: true, message: "场所类型" }],
        placeName: [{ required: true, message: "场所名称" }],
        policeStation: [{ required: true, message: "所属派出所" }],
        policeOfficerId: [{ required: true, message: "所属社区民警" }],
        address: [{ required: true, message: "场所地址" }],
        contactPerson: [{ required: true, message: "场所联系人" }],
        contactPhone: [
          { required: true, message: "场所联系电话" },
          { validator: validatePhone, trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    formdata() {
      return {
        address: "",
        communityPolice: "",
        contactPerson: "",
        contactPhone: "",
        placeType: "",
        address: "",
        policeStation: "",
        policeOfficerId: ""
      };
    },
    handleClose(done){
      done()
      this.close('form')
    },
    // 查询民警名字
    selectChange(val) {
      const result = this.restaurants.filter((item) => item.id === val);
      this.form.policeStation = result[0].unitName;
      this.form.communityPolice = result[0].name;
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
    open() {
      this.form = {
        address: "",
        communityPolice: "",
        contactPerson: "",
        contactPhone: "",
        placeType: "",
        address: "",
        policeStation: "",
        policeOfficerId: ""
      };
      this.getAll();
      this.visible = true;
    },
    close(formName) {
      this.$refs[formName].resetFields();
      this.form = this.formdata();
      this.visible = false;
    },
    submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          try {
            const res = await baseService.post("exam/api/place/add", this.form);
            this.$notify({
              title: "成功",
              message: "新增成功",
              type: "success",
              duration: 2000
            });
            this.close("form");
            this.$emit("refresh");
          } catch (error) {
            console.log("信息添加错误", error);
          }
        } else {
          return false;
        }
      });
    }
  }
};
</script>
