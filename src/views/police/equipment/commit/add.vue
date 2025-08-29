<template>
  <el-dialog :title="typeText[type]" width="70%" v-model="visible" :before-close="handleClose">
    <el-form ref="form" :model="form" :rules="rules" label-position="right" label-width="120px">
      <el-card>
        <el-row :gutter="20" type="flex" justify="space-between" style="flex-wrap: wrap">
          <el-col :span="12">
            <el-form-item label="场所名称" prop="placeId">
              <el-select style="width: 100%" v-model="form.placeId" @change="selectChange" filterable remote reserve-keyword placeholder="请输入关键词" :remote-method="remoteMethod" :loading="loading" :disabled="disabled">
                <el-option v-for="item in selectList" :key="item.id" :label="item.placeName" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="设备型号" prop="placeType">
              <el-select :disabled="disabled" v-model="form.deviceModelId" placeholder="请选择" style="width: 100%">
                <el-option v-for="item in deviceModelList" :key="item.code" :label="item.name" :value="item.code"></el-option>
              </el-select>
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
            <el-form-item label="所属派出所" prop="policeStation">
              <el-input v-model="form.policeStation" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="所属社区民警" prop="communityPolice">
              <el-input v-model="form.communityPolice" disabled />
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
          <el-col :span="12">
            <el-form-item label="设备绑定状态" prop="bindingStatus">
              <el-select v-model="form.bindingStatus" placeholder="请选择" style="width: 100%" disabled>
                <el-option v-for="item in bindingStatusData" :key="item.code" :label="item.name" :value="item.code"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="绑定数量" prop="deviceQrcodesCount">
              <el-input v-model="form.deviceQrcodesCount" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
      <el-card class="box-card" v-if="type != 'add'" style="margin-top: 10px">
        <div slot="header" class="clearfix">
          <span>绑定记录</span>
        </div>
        <el-table :data="bindingList" :border="true" style="width: 100%; margin-top: 10px">
          <el-table-column label="序号" type="index" width="80" />
          <el-table-column label="码id" prop="qrCodeSerialNum" />
          <el-table-column label="绑定人员" prop="bindingPerson" />
          <el-table-column label="绑定时间" prop="createTime" />

          <el-table-column label="操作" align="center" width="160px">
            <template v-slot="scope">
              <el-popconfirm class="box-item" title="这是一条数据确定解绑吗？" placement="top-start" @confirm="unbindItem(scope.row)">
                <template #reference>
                  <el-button slot="reference" type="info" size="small">解绑</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
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
import { placeTypeData, bindingStatusData } from "@/dictionary/index";
import baseService from "@/service/baseService";
export default {
  props: {
    deviceModelList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      disabled: false,

      type: "add",
      typeText: {
        add: "新增",
        updata: "编辑",
        detail: "详情"
      },
      placeTypeData,
      bindingStatusData,
      restaurants: [],
      selectList: [],
      selectedItem: null,
      loading: false,
      form: {
        address: "",
        communityPolice: "",
        contactPerson: "",
        contactPhone: "",
        placeType: "",
        placeId: "",
        deviceModelId: "",
        placeName: "",
        address: "",
        policeStation: "",
        deviceModel: "",
        policeId: "",
        bindingStatus: "",
        bindingTime: "",
        bindingPerson: "",
        deviceQrcodesCount: ""
      },
      bindingList: [],
      rules: {
        deviceModelId: [{ required: true, message: "请选择设备型号" }],
        placeId: [{ required: true, message: "请选择场所名称" }]
      }
    };
  },
  methods: {
    handleClose(done) {
      done();
      this.close("form");
    },

    // 选择场所
    selectChange(val) {
      const selectedPlace = this.selectList.find((item) => item.id === val);

      this.form.placeName = selectedPlace.placeName;
      this.form.address = selectedPlace.address;
      this.form.contactPerson = selectedPlace.contactPerson;
      this.form.placeType = selectedPlace.placeType;
      this.form.policeStation = selectedPlace.policeStation;
      this.form.communityPolice = selectedPlace.communityPolice;
      this.form.contactPhone = selectedPlace.contactPhone;
    },
    // 获取所有场所信息
    async getAll() {
      try {
        const response = await baseService.post("exam/api/place/queryAllPlace");
        this.restaurants = response.data || [];
        if (this.type != "add") {
          this.selectList = response.data;
        }
        console.log(response.data, 9999999);
      } catch (error) {
        console.error("加载场所数据失败:", error);
        this.restaurants = [];
      }
    },
    // 查询绑定记录
    async getDeviceQrCodeList() {
      const res = await baseService.post("exam/api/deviceQrCode/list", { deviceId: this.form.id });
      if (res.code == 0) {
        this.bindingList = res.data;
      } else {
        this.$notify({
          message: res.msg,
          type: "error",
          duration: 2000
        });
      }
    },
    async Unbind() {
      try {
        await baseService.post("exam/api/device/unbind", { id: this.form.id });
        this.$notify({
          message: "解绑成功",
          type: "success",
          duration: 2000
        });
        this.close("form");
        this.$emit("refresh");
      } catch (error) {
        console.log("解绑错误", error);
      }
    },
    async unbindItem(val) {
      const res = await baseService.post("exam/api/deviceQrCode/unbind", { id: val.id });
      if (res.code == 0) {
        this.getDeviceQrCodeList();
        this.$notify({
          message: "解绑成功",
          type: "success",
          duration: 2000
        });
      } else {
        this.$notify({
          message: res.msg,
          type: "error",
          duration: 2000
        });
      }
    },
    // 筛选场所
    remoteMethod(query) {
      console.log(query);
      if (query !== "") {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.selectList = this.restaurants.filter((item) => {
            return item.placeName && item.placeName.includes(query);
          });
        }, 200);
      } else {
        this.selectList = [];
      }
    },
    open(record) {
      this.getAll();

      this.type = record.type;
      this.visible = true;
      this.disabled = this.type === "detail";
      if (this.type === "add") {
        this.$nextTick(() => {
          this.form = {
            address: "",
            communityPolice: "",
            contactPerson: "",
            contactPhone: "",
            placeType: "",
            placeId: "",
            deviceModelId: "",
            placeName: "",
            address: "",
            policeStation: "",
            deviceModel: "",
            policeId: "",
            bindingStatus: "",
            bindingTime: "",
            bindingPerson: "",
            deviceQrcodesCount: ""
          };
        });

        if (this.$refs.form) {
          this.$refs.form.resetFields();
          this.bindingList = [];
        }
      } else {
        this.form = JSON.parse(JSON.stringify(record.params));
        this.getDeviceQrCodeList();
      }
    },
    close(formName) {
      this.$refs.form.resetFields();
      this.visible = false;
    },
    async request(apiFunc) {
      try {
        const response = await apiFunc(this.form);
        if (response.code === 0) {
          this.$notify({
            title: "成功",
            message: this.typeText[this.type] + "成功",
            type: "success",
            duration: 2000
          });
          this.close();
          this.$emit("refresh");
        } else {
          this.$notify({
            message: response.msg || "操作失败",
            type: "error",
            duration: 2000
          });
        }
      } catch (error) {
        this.$notify({
          message: "请求失败，请稍后重试",
          type: "error",
          duration: 2000
        });
        console.error("请求错误：", error);
      }
    },

    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.type === "add") {
            this.request((form) => baseService.post("exam/api/device/add", form));
          } else if (this.type === "updata") {
            this.request((form) => baseService.post("exam/api/device/update", form));
          } else {
            this.visible = false;
          }
        } else {
          return false;
        }
      });
    }
  }
};
</script>
