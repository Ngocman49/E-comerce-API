const obj = {
  c: {
    d: 2,
    e: 3,
    f: {
      s: 4,
      c: 5,
    },
  },
  a: 1,
  b: 2,
};

const nestedUpdate = (obj) => {
  const final = {};
  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === 'object') {
      const response = nestedUpdate(obj[k]);
      Object.keys(response).forEach((a) => {
        final[`${k}.${a}`] = response[a];
      });
    } else {
      final[k] = obj[k];
    }
  });
  return final;
};

nestedUpdate(obj);
console.log(obj);
