
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebPackPlugin = require('copy-webpack-plugin')

const port = process.env.PORT || 3001;

module.exports = {
    context: __dirname,
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'src/index.jsx'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.jsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react']
                },
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader', 'eslint-loader']
            }
        ]
    },
    devServer: {
        port,
        historyApiFallback: true,
        publicPath: '/',
        open: true,
        proxy: [
            {
                context: '/api',
                target: `http://localhost:23333`,
                logLevel: 'debug',
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'src/index.html') }),
        new CopyWebPackPlugin([{from:'src/images',to:'images'}])
    ],
};