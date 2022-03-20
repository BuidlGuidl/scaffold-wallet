global.window = {
  store: {},
  location: {},
  localStorage: {
    getItem: (key) => {
      return window.store[key];
    },
    setItem: (key, value) => {
      window.store[key] = value;
    },
  },
};
