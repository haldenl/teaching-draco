import commonjs from "rollup-plugin-commonjs";
import builtins from "rollup-plugin-node-builtins";
import nodeResolve from "rollup-plugin-node-resolve";

export default {
  input: "js/build/index.js",
  output: {
    file: "js/build/bundle.js",
    format: "cjs",
    sourcemap: true
  },
  plugins: [nodeResolve(), commonjs(), builtins()]
};
