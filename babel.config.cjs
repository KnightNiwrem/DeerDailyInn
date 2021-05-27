const babelConfig = api => {
  api.cache(false);
  const plugins = [
    [
      "module-resolver",
      {
        "root": ["./"],
        "alias": {
          "configs": "./configs",
          "constants": "./dist/constants",
          "controllers": "./dist/controllers",
          "models": "./dist/models",
          "routes": "./dist/routes",
          "services": "./dist/services",
          "views": "./dist/views",
          "utils": "./dist/utils",
        },
      },
    ],
  ];
  return { plugins };
};

module.exports = babelConfig;
