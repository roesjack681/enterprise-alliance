 // 配置webpack-dev-server
const path = require('path');   
// const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
 
module.exports = {
    entry: './src/index.ts',
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'app-adminapi.min.js'
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
    externals: {
       
    },
    mode: 'production',
    plugins: [   
        // new NodePolyfillPlugin(),
        new CleanWebpackPlugin()
    ]

}
