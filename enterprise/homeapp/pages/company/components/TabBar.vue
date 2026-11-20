<template>
  <u-tabbar
    :value="currentValue"
    :placeholder="false"
    @change="onTabChange"
  >
    <u-tabbar-item 
      v-for="(item, index) in visibleMenuItems" 
      :key="item.id" 
      :text="item.text" 
      :icon="item.icon"
    ></u-tabbar-item>
  </u-tabbar>
</template>

<script>
import { getSettings } from '@/utils/api.js'

export default {
  name: 'TabBar',
  props: {
    current: {
      type: [Number, String],
      default: 0
    },
    pagePath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      currentValue: 0,
      enterpriseId: null,
      settings: {
        show_banner: 1,
        show_about: 1,
        show_products: 1,
        show_articles: 1,
        show_cases: 1,
        show_contact: 1
      },
      menuItems: [
        {
          id: 0,
          text: '首页',
          icon: 'bookmark-fill',
          url: '/pages/company/home',
          settingKey: null  // 首页始终显示
        },
        {
          id: 1,
          text: '产品',
          icon: 'bookmark-fill',
          url: '/pages/company/products',
          settingKey: 'show_products'
        },
        {
          id: 2,
          text: '新闻',
          icon: 'bookmark-fill',
          url: '/pages/company/news',
          settingKey: 'show_articles'
        },
        {
          id: 3,
          text: '案例',
          icon: 'bookmark-fill',
          url: '/pages/company/case',
          settingKey: 'show_cases'
        },
        {
          id: 4,
          text: '关于',
          icon: 'bookmark-fill',
          url: '/pages/company/about',
          settingKey: 'show_about'
        }
      ]
    }
  },
  computed: {
    visibleMenuItems() {
      // 过滤菜单项，只显示启用的部分
      return this.menuItems.filter(item => {
        // 首页始终显示
        if (item.settingKey === null) return true
        
        // 检查对应的设置是否启用
        return this.settings[item.settingKey] === 1
      })
    }
  },
  created() {
    // 获取企业ID
    this.enterpriseId = uni.getStorageSync('enterpriseId')
    // 加载设置
    this.loadSettings()
    // 初始化当前值
    this.initCurrentValue()
  },
  watch: {
    current(newVal) {
      // 如果传入了明确的current值，则使用它
      if (newVal !== undefined && newVal !== null) {
        this.updateCurrentValue(newVal)
      }
    },
    pagePath(newVal) {
      // 如果传入了页面路径，则根据路径确定当前值
      if (newVal) {
        this.setCurrentByPath(newVal)
      }
    },
    visibleMenuItems: {
      handler() {
        // 当可见菜单项变化时，重新计算当前值
        this.initCurrentValue()
      },
      deep: true
    }
  },
  methods: {
    // 加载设置
    async loadSettings() {
      try {
        // 先尝试从缓存加载设置
        this.loadSettingsFromCache()
        
        // 如果没有缓存或缓存过期，则从API获取
        if (!this.settingsLoaded) {
          await this.fetchSettings()
        }
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    },
    
    // 从缓存加载设置
    loadSettingsFromCache() {
      try {
        const cacheKey = `homepage_data_${this.enterpriseId}`
        const cachedData = uni.getStorageSync(cacheKey)
        if (cachedData) {
          const parsed = JSON.parse(cachedData)
          const { data, timestamp } = parsed
          const now = Date.now()
          // 缓存有效期5分钟
          if (data && now - timestamp < 5 * 60 * 1000 && data.companyInfo) {
            this.settings = {
              ...this.settings,
              ...data.companyInfo
            }
            this.settingsLoaded = true
            return true
          }
        }
        return false
      } catch (error) {
        console.error('从缓存加载设置失败:', error)
        return false
      }
    },
    
    // 从API获取设置
    async fetchSettings() {
      try {
        const response = await getSettings({ enterpriseId: this.enterpriseId })
        if (response.code === 0 && response.data) {
          this.settings = {
            ...this.settings,
            ...response.data
          }
          
          // 保存到缓存
          this.saveSettingsToCache()
          this.settingsLoaded = true
        }
      } catch (error) {
        console.error('获取设置失败:', error)
      }
    },
    
    // 保存设置到缓存
    saveSettingsToCache() {
      try {
        const cacheKey = `tabbar_settings_${this.enterpriseId}`
        const cacheData = {
          settings: this.settings,
          timestamp: Date.now()
        }
        uni.setStorageSync(cacheKey, JSON.stringify(cacheData))
      } catch (error) {
        console.error('保存设置到缓存失败:', error)
      }
    },
    
    // 初始化当前值
    initCurrentValue() {
      // 如果有传入pagePath，优先使用pagePath
      if (this.pagePath) {
        this.setCurrentByPath(this.pagePath)
        return
      }
      
      // 否则尝试使用current
      if (this.current !== undefined && this.current !== null) {
        this.updateCurrentValue(this.current)
      } else {
        // 默认选中首页
        this.currentValue = 0
      }
    },
    
    // 根据页面路径设置当前值
    setCurrentByPath(path) {
      // 找到匹配的菜单项
      const normalizedPath = path.startsWith('/') ? path : `/${path}`
      const index = this.visibleMenuItems.findIndex(item => 
        item.url === normalizedPath || 
        normalizedPath.includes(item.url.replace('/pages/company/', ''))
      )
      
      if (index !== -1) {
        this.currentValue = index
      } else {
        // 如果没有匹配的菜单项，默认选中首页
        this.currentValue = 0
      }
    },
    
    // 更新当前值
    updateCurrentValue(value) {
      // 如果value是菜单项ID
      if (typeof value === 'number') {
        // 查找对应ID的菜单项在visibleMenuItems中的索引
        const menuItem = this.menuItems.find(item => item.id === value)
        if (menuItem) {
          const index = this.visibleMenuItems.findIndex(item => item.id === menuItem.id)
          if (index !== -1) {
            this.currentValue = index
            return
          }
        }
        
        // 如果找不到对应的菜单项，尝试直接使用value作为索引
        if (value >= 0 && value < this.visibleMenuItems.length) {
          this.currentValue = value
        } else {
          // 默认选中首页
          this.currentValue = 0
        }
      } else {
        // 如果value是字符串（可能是路径或名称）
        this.setCurrentByPath(value)
      }
    },
    
    onTabChange(name) {
      // 如果点击的是当前页面，不进行跳转
      if (name === this.currentValue) {
        return
      }
      
      this.currentValue = name
      
      // 添加触感反馈
      
      // 获取可见菜单项的URL
      const visibleItem = this.visibleMenuItems[name]
      if (visibleItem && visibleItem.url) {
        uni.redirectTo({ url: visibleItem.url })
      }
    }
  }
}

</script>

<style lang="scss">
/* 注意：必须移除 scoped，否则样式无法穿透到 uView 组件 */

/* TabBar 图标大小样式 */
.u-tabbar-item {
	.u-tabbar-item__icon {
		font-size: 48rpx !important;
		
		.u-icon {
			font-size: 48rpx !important;
		}
	}
	
	.u-tabbar-item__text {
		font-size: 24rpx !important;
		margin-top: 4rpx !important;
	}
}

/* 兼容不同版本的 uView 类名 */
.u-tabbar__content__item {
	.u-tabbar__content__item__icon {
		font-size: 48rpx !important;
		
		.u-icon {
			font-size: 48rpx !important;
		}
	}
	
	.u-tabbar__content__item__text {
		font-size: 24rpx !important;
		margin-top: 4rpx !important;
	}
}
</style>