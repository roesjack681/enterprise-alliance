 // 配置webpack-dev-server
const path = require('path');   
// const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
 
module.exports = {
    entry: './src/index.ts',
    mode:'production',
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'app-api.min.js'
    },
   module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/  
            }
        ]
   }, 
    resolve: {
        extensions: ['.ts','.js','tsx'], 
    },   
    externals: nodeExternals({
      allowlist: [/^lodash/, /^express/, /^mongoose/],
    }),
    mode: 'production',
    plugins: [   
        // new NodePolyfillPlugin(),
        new CleanWebpackPlugin()
    ]

}
