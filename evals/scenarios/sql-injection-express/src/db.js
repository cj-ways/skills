// Stub database module for eval scenario
export const db = {
  query(sql, params, callback) {
    if (typeof params === "function") {
      callback = params;
      params = [];
    }
    callback(null, []);
  },
};
