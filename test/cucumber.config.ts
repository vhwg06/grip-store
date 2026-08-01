module.exports = {
  paths: ["modules/**/*.feature"],
  requireModule: ["tsx/cjs"],
  require: ["shared/cucumber/**/*.ts", "modules/**/*.steps.ts"],
  format: ["progress"],
  publishQuiet: true,
};
