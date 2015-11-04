// http://underscorejs.org/docs/underscore.html
var mergeDeep = function (A, B, depth) {
  var forever = depth == null; // eslint-ignore-line eqeqeq
  for (var p in B) {
    if (B[p] !== null && typeof B[p] !== 'undefined' && B[p].constructor === Object && (forever || depth > 0)) {
      A[p] = _.mergeDeep(
        A.hasOwnProperty(p) ? A[p] : {},
        B[p],
        forever ? null : depth - 1
      );
    }
    // we generally don't want 'undefined' values in our maps
    else if (typeof B[p] === 'undefined') {} // esline-ignore-line no-empty
    else {
      A[p] = B[p];
    }
  }
  return A;
};

var merge = function(A, B, depth) {
  var Acopy = mergeDeep({}, A);
  return mergeDeep(Acopy, B, depth);
};

module.exports = merge;
