const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    target: 'web',
    entry: './src/index.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'),
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        alias: {
            'globals': path.resolve(__dirname, './src/global')
        }
    },
    devtool: process.env.NODE_ENV === 'production' ? false : 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader",
                exclude: [/node_modules/, /lib/],
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loaders: ['source-map-loader', 'babel-loader'],
                exclude: [/node_modules/, /lib/],
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader'],
                exclude: [/node_modules/, /lib/],
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: 'file-loader',
            },
            {
                test: /\.woff|\.woff2|\.svg|.eot|\.ttf/,
                loader: 'url-loader?prefix=font/&limit=10000',
            }]
    },
    plugins: [
        new webpack.ProvidePlugin({
            'globals': 'globals'
        }),
        new HtmlWebpackPlugin({
            title: 'room viewer',
            filename: 'index.html',
            template: './template.html',
        }),
    ]
}