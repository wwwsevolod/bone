/* global __dirname */
/* eslint-disable */

var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
        index: ['./src/index.ts']
    },

    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js'
    },

    resolve: {
        extensions: ['', '.js', '.ts', '.tsx']
    },

    module: {
        loaders: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loaders: ['babel-loader?optional=runtime&stage=1'],
                cacheDirectory: true
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                loaders: [
                    'babel-loader?optional=runtime&stage=1',
                    'awesome-typescript-loader'
                ],
                cacheDirectory: true
            }
        ]
    },

    plugins: [new webpack.DefinePlugin({
        process: {
            env: {
                TESTS: false
            }
        }
    })]
};
