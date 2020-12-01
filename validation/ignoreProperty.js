const ignoreProperty = (data, listKeyIgnore =[]) => {
  return Object.entries(data).reduce((ans, [key, value]) => {
    if (!listKeyIgnore.includes(key)) {
      ans[key] = value;
    }
    return ans;
  }, {});
};

module.exports = ignoreProperty;
