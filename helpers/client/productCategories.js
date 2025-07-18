const createTreeCategory = require('../createTree');

module.exports.getChildrenProductCategory = function(categories, target) {
  const allChildren = getChildrenByParent(categories, target._id);
  
  return [target, ...allChildren]; 
  
  function getChildrenByParent(categories, parentId) {
    let result = [];

    const children = categories.filter(c => c.parent_id?.toString() === parentId.toString());

    for (let child of children) {
      result.push(child); 
      result = result.concat(getChildrenByParent(categories, child._id)); 
    }

    return result;
  }
};
