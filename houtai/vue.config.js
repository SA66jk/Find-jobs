module.exports = {
	productionSourceMap: false,
	publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
	lintOnSave: false,
	devServer: {
		open: process.env.VUE_APP_OPEN === 'false' ? false : true, // 自动打开浏览器
		host: '0.0.0.0', // 真机模拟，使用
		port: process.env.VUE_APP_PORT, // 前台代理端口号
		https: false, // https： {type: Booleam}
		hotOnly: false, // 热update
		proxy: {
			// 设置代理
			'/': {
				target: 'http://localhost:8888/',
				ws: true,
				changeOrigin: true,
				pathRewrite: {
					'^/': '',
				},
			},
		},
	},
	chainWebpack(config) {
		// 移除打包后 index.html 所有打包好的file都预加载行为
		config.plugins.delete('preload');
		config.plugins.delete('prefetch');
	},
	css: {
		extract: { ignoreOrder: true },
	},
};
