/**
 * 校验中国大陆手机号或座机号
 * @param {Object} rule - 表单校验规则对象
 * @param {string} value - 输入的值
 * @param {Function} callback - 回调函数
 */
 export function validatePhone(rule, value, callback) {
    if (!value) {
      return callback(new Error('请输入联系电话'));
    }
  
    // 手机号正则（11位，1开头）
    const mobileRegex = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/;
  
    // 座机号正则（带区号，如 010-12345678 或 0512-1234567）
    const landlineRegex = /^(?:(?:\d{3}-)?\d{8}|(?:\d{4}-)?\d{7})$/;
  
    if (mobileRegex.test(value) || landlineRegex.test(value)) {
      callback();
    } else {
      callback(new Error('请输入正确的手机号或座机号（如 13812345678 或 010-12345678）'));
    }
  }
/**
 * 根据 code 返回对应的 name
 * @param {Array} data - 数据源（如 placeTypeData）
 * @param {number|string} code - 要查找的 code
 * @returns {string} - 返回匹配的 name，未找到时返回默认值（如空字符串或自定义提示）
 */
  export function getName(data, code) {
    const item = data.find(item => item.code === code);
    return item ? item.name : ''; // 未找到时返回空字符串（可自定义默认值）
  }