
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

const port = process.env.PORT || 3001;

module.exports = {
    context: __dirname,
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
                target: `http://localhost:6888`,
                logLevel: 'debug',
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'src/index.html') })
    ]
};