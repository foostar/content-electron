const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BabiliPlugin = require('babili-webpack-plugin');
const pkg = require('./package.json');

let theme = {};
if (pkg.theme && typeof pkg.theme === 'string') {
    let cfgPath = pkg.theme;
    // relative path
    if (cfgPath.charAt(0) === '.') {
        cfgPath = path.resolve(__dirname, cfgPath);
    }
    const getThemeConfig = require(cfgPath);
    theme = getThemeConfig();
} else if (pkg.theme && typeof pkg.theme === 'object') {
    theme = pkg.theme;
}

const config = {
    entry: './src/app.jsx',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public')
    },
    target: 'electron-renderer',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    `less-loader?{"modifyVars":${JSON.stringify(theme)}}`
                ]
            },
            {
                test: /\.styl$/,
                use: [
                    'style-loader',
                    'css-loader?modules&constLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
                    'stylus-loader'
                ]
            },
            {
                test: /\.(png)|(gif)|(jpg)$/,
                use: 'url-loader'
            },
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader?limit=10000&mimetype=application/font-woff'
            }, {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader?limit=10000&mimetype=application/font-woff'
            }, {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader?limit=10000&mimetype=application/octet-stream'
            }, {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader'
            }, {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader?limit=10000&mimetype=image/svg+xml'
            }

        ]
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, 'src')
        ],
        extensions: ['.js', '.jsx', '.json']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'index.html')
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ],
    devServer: {
        port: 8000,
        inline: true
    }
};

if (process.env.NODE_ENV === 'production') {
    if (!process.env.API_PREFIX) {
        throw Error('no API_PREFIX!');
    }
    config.plugins.push(
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                API_PREFIX: JSON.stringify(process.env.API_PREFIX)
            }
        }),
        new BabiliPlugin()
    );
}

module.exports = config;
