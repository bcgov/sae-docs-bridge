function wait(t = 1000) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}

/**
   a = search result, b = cached document
   returns true if cached is outdated
*/
function compare(a, b = []) {
  if (b.length === 0) {
    return true;
  }

  return b.some(d => d.meta.revised < a.revised);
}

module.exports = {
  compare,
  wait,
};
