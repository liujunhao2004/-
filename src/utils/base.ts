import { reactive, ref, isRef, isReactive } from 'vue';
// 清空表单
export const resetForm = (target: any) => {
  if (isRef(target)) {
    target.value = [];
    return;
  }
  if (isReactive(target)) {
    Object.keys(target).forEach((key) => {
      const val = target[key];
      if (Array.isArray(val)) {
        val.length = 0;
      } else if (typeof val === 'object' && val !== null) {
        resetForm(val); 
      } else {
        target[key] = ""; 
      }
    });
  }
};