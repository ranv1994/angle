const htmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack'); //to access built-in plugins

module.exports = {
    entry: './src/index.js?v=1.0',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js?v=1.0'
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif|gltf)$/i,
                type: 'asset/resource',
            }
        ],
    },
    plugins: [
        new htmlWebpackPlugin({
            template: './src/index.html'
        })
    ],
    devServer: {
        static: {
          directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 8080,
        allowedHosts: ["hawkeye-bcci-dev.epicon.in","hawkeye-bcci.onrender.com"]
        //disableHostCheck : true,
    },
}