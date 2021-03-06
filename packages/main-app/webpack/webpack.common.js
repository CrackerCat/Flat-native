const paths = require("./paths");
const threadLoader = require("thread-loader");
const { NoEmitOnErrorsPlugin, NamedModulesPlugin } = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const isDevelopment = process.env.NODE_ENV === "development";

const workerCommonOptions = {
    workerParallelJobs: 50,
    poolParallelJobs: 50,
    poolTimeout: isDevelopment ? Infinity : 1000,
    workerNodeArgs: ["--max-old-space-size=2048"],
};

const tsWorkerOptions = {
    ...workerCommonOptions,
    name: "ts-pool",
};

threadLoader.warmup(tsWorkerOptions, ["eslint-loader", "babel-loader"]);

module.exports = {
    entry: [paths.entryFile],
    target: "electron-main",

    stats: {
        colors: true,
    },

    node: {
        __filename: isDevelopment,
        __dirname: isDevelopment,
    },

    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: [
                    {
                        loader: "babel-loader",
                    },
                    {
                        loader: "eslint-loader",
                        options: {
                            fix: true,
                        },
                    },
                    {
                        loader: "thread-loader",
                        options: tsWorkerOptions,
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },

    plugins: [
        new NamedModulesPlugin(),
        new NoEmitOnErrorsPlugin(),
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                configFile: paths.tsConfig,
                diagnosticOptions: {
                    semantic: true,
                    syntactic: true,
                    declaration: true,
                },
            },
        }),
    ],

    externals: {
        "agora-electron-sdk": "commonjs2 agora-electron-sdk",
    },

    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        filename: "main.js",
        path: paths.dist,
        libraryTarget: "commonjs2",
    },
};
