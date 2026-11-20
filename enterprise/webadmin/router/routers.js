import Layout from '@/layout/index'

export default [{
		path: '/login',
		component: () => import('@/pages/login/login.vue'),
		name: 'login',
		meta: {
			title: '用户登录',
			hideInMenu: true,
			hideInBread: true
		}
	},
	{
		path: '/',
		name: '_index',
		component: Layout,
		meta: {
			title: '首页',
			hideInMenu: true,
			icon: 'md-home'
		},
		children: [{
			path: 'index',
			name: 'index',
			meta: {
				title: '首页',
				icon: 'md-home'
			},
			component: () => import('@/pages/index/index')
		}]
	},
	{
		path: '/admin',
		component: Layout,
		name: '/admin/admin',
		meta: {
			title: '系统管理',
			icon: 'el-icon-s-order'
		},
		children: [{
				path: 'roles',
				name: 'roles',
				meta: {
					title: '角色管理',
					access: ['roles']
				},
				component: () => import('@/pages/admin/roles')
			},
			{
				path: 'admin',
				name: 'admin',
				meta: {
					title: '管理员管理',
					access: ['admin']
				},
				component: () => import('@/pages/admin/admin')
			},
			{
				path: 'mch',
				name: 'mch',
				meta: {
					title: '商户管理',
					access: ['mch']
				},
				component: () => import('@/pages/mch/mch')
			},
			{
				path: 'category',
				name: 'category',
				meta: {
					title: '系统分类',
					access: ['category']
				},
				component: () => import('@/pages/admin/category')
			},
			{
				path: 'sysset',
				name: 'sysset',
				meta: {
					title: '系统配置',
					access: ['sysset']
				},
				component: () => import('@/pages/admin/sysset')
			},
			{
				path: 'homeset',
				name: 'homeset',
				meta: {
					title: '主页设置',
					access: ['homeset']
				},
				component: () => import('@/pages/admin/homeset')
			}
		]
	},
	
	
	{
		path: '/product',
		component: Layout,
		name: '/product/index',
		meta: {
			title: '服务管理',
			icon: 'el-icon-goods'
		},
		children: [{
			path: 'product',
			name: 'product',
			meta: {
				title: '服务管理',
				access: ['product']
			},
			component: () => import('@/pages/product/product')
		}, {
			path: 'product-category',
			name: 'product-category',
			meta: {
				title: '分类管理',
				access: ['productCategory']
			},
			component: () => import('@/pages/product/category')
		}, ]
	},
	{
		path: '/order',
		component: Layout,
		name: '/order/list',
		meta: {
			title: '订单管理',
			icon: 'el-icon-s-order'
		},
		children: [{
			path: 'order',
			name: 'order',
			meta: {
				title: '订单管理',
				access: ['order']
			},
			component: () => import('@/pages/order/list')
		}]
	},
	{
		path: '/user',
		component: Layout,
		name: '/user/user',
		meta: {
			title: '用户管理',
			icon: 'el-icon-user'
		},
		children: [{
			path: 'user',
			name: 'user',
			meta: {
				title: '用户管理',
				access: ['user']
			},
			component: () => import('@/pages/user/user')
		}, {
			path: 'feedback',
			name: 'feedback',
			meta: {
				title: '意见反馈',
				access: ['feedback']
			},
			component: () => import('@/pages/user/feedback')
		}]
	},
	{
		path: '/money-log',
		component: Layout,
		name: '/money-log/index',
		meta: {
			title: '财务管理',
			icon: 'el-icon-money'
		},
		children: [{
				path: 'money-log',
				name: 'money-log',
				meta: {
					title: '资金记录',
					access: ['moneyLog']
				},
				component: () => import('@/pages/money-log/index')
			},
			{
				path: 'tixian-log',
				name: 'tixian-log',
				meta: {
					title: '提现管理',
					access: ['tixianLog']
				},
				component: () => import('@/pages/tixian-log/index')
			}
		]
	},
	{
		path: '/advert',
		component: Layout,
		name: '/advert/index',
		meta: {
			title: '广告管理',
			icon: 'el-icon-film'
		},
		children: [{
			path: 'navigator',
			name: 'navigator',
			meta: {
				title: '导航管理',
				access: ['navigator']
			},
			component: () => import('@/pages/advert/navigator')
		}, {
			path: 'advert',
			name: 'advert',
			meta: {
				title: '广告管理',
				access: ['advert']
			},
			component: () => import('@/pages/advert/advert')
		}]
	},
	{
		path: '/article',
		component: Layout,
		name: '/article/index',
		meta: {
			title: '文章管理',
			icon: 'el-icon-notebook-1'
		},
		children: [{
			path: 'article',
			name: 'article',
			meta: {
				title: '文章列表',
				access: ['article']
			},
			component: () => import('@/pages/article/article')
		}, {
			path: 'article-category',
			name: 'article-category',
			meta: {
				title: '文章分类',
				access: ['articleCategory']
			},
			component: () => import('@/pages/article/category')
		}]
	},
	{
		path: '/serviceFlow',
		component: Layout,
		name: '/serviceFlow/index',
		meta: {
			title: '服务流程管理',
			icon: 'el-icon-s-cooperation'
		},
		children: [{
			path: 'flow-dashboard',
			name: 'flow-dashboard',
			meta: {
				title: '工作台',
				access: ['flow-dashboard']
			},
			component: () => import('@/pages/serviceFlow/dashboard')
		}, {
			path: 'flow-order',
			name: 'flow-order',
			meta: {
				title: '订单管理',
				access: ['flow-order']
			},
			component: () => import('@/pages/serviceFlow/order')
		}, {
			path: 'flow-monitoring',
			name: 'flow-monitoring',
			meta: {
				title: '流程监控',
				access: ['flow-monitoring']
			},
			component: () => import('@/pages/serviceFlow/monitoring')
		}, {
			path: 'flow-template',
			name: 'flow-template',
			meta: {
				title: '流程模板',
				access: ['flow-template']
			},
			component: () => import('@/pages/serviceFlow/template')
		}]
	},
	{
		path: '/401',
		name: 'error_401',
		meta: {
			hideInMenu: true
		},
		component: () => import('@/pages/error-page/401.vue')
	},
	{
		path: '/500',
		name: 'error_500',
		meta: {
			hideInMenu: true
		},
		component: () => import('@/pages/error-page/500.vue')
	},
	{
		path: '*',
		name: 'error_404',
		meta: {
			hideInMenu: true
		},
		component: () => import('@/pages/error-page/404.vue')
	}
]