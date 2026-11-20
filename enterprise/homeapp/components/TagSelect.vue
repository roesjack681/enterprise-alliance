<template>
  <view>
    <!-- 标签选择弹窗 -->
    <u-popup 
      :show="show" 
      mode="bottom" 
      :height="popupHeight"
      :border-radius="20"
      :closeable="true"
      @close="handleClose"
      @open="handleOpen"
    >
      <view class="tag-selector">
        <!-- 标题 -->
        <view class="header">
          <text class="title">选择标签</text>
        </view>
        
        <!-- 已选标签 -->
        <view class="selected-section" v-if="selectedTags.length > 0">
          <text class="section-title">已选标签 ({{ selectedTags.length }})</text>
          <view class="tag-list">
            <u-tag 
              v-for="(tag, index) in selectedTags" 
              :key="index"
              :text="tag.name"
              type="primary"
              shape="circle"
              closable
              @close="removeTag(tag)"
              style="margin: 4px;"
			  
            />
          </view>
        </view>
        
        <!-- 标签分类 -->
        <scroll-view class="content" scroll-y >
          <view v-for="(category, categoryIndex) in tagCategories" :key="categoryIndex" class="category">
            <text class="category-title">{{ category.name }}</text>
            <view class="tag-list">
              <u-tag 
                v-for="(tag, tagIndex) in category.tags" 
                :key="tagIndex"
                :text="tag.name"
                :type="isSelected(tag) ? 'primary' : 'info'"
                :plain="!isSelected(tag)"
                shape="circle"
                @click="toggleTag(tag)" 
                style="margin: 4px; cursor: pointer;"
				
              />
            </view>
          </view>
        </scroll-view>
        
        <!-- 自定义添加 -->
        <view class="custom-section">
          <text class="section-title">自定义标签</text>
          <view class="custom-input-wrapper">
            <view class="input-box">
              <input 
                v-model="customTagName"
                placeholder="输入自定义标签名称"
                class="custom-input"
                @confirm="addCustomTag"
                maxlength="10"
              />
              <view 
                v-if="customTagName"
                class="clear-btn"
                @click="customTagName = ''"
              >
                <u-icon name="close-circle-fill" size="32" color="#c8c9cc"></u-icon>
              </view>
            </view>
            <view 
              class="add-button"
              :class="{ 'add-button-disabled': !customTagName.trim() }"
              @click="addCustomTag"
            >
              <text class="add-button-text">添加</text>
            </view>
          </view>
        </view>
        
        <!-- 底部按钮 -->
        <view class="footer">
          <u-button 
            type="default" 
            @click="handleClose"
            style="margin-right: 20rpx;"
          >
            取消
          </u-button>
          <u-button 
            type="primary" 
            @click="confirmSelection"
          >
            确定 ({{ selectedTags.length }})
          </u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
	import {getTags} from "@/utils/api.js"
export default {
  name: 'TagSelector',
  props: {
    // 控制弹窗显示
    value: {
      type: Boolean,
      default: false
    },
    // 已选中的标签
    selectedTagList: {
      type: Array,
      default: () => []
    },
    // 标签分类数据
    categories: {
      type: Array,
      default: () => []
    },
    // 最大选择数量
    maxSelect: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      show: false,
      popupHeight: '70%',
      selectedTags: [],
      customTagName: '',
      tagCategories: []
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.show = newVal;
      },
      immediate: true
    },
    selectedTagList: {
      handler(newVal) {
        this.selectedTags = [...newVal];
      },
      immediate: true,
      deep: true
    },
    categories: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.tagCategories = newVal;
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
  	getTags({}).then(res=>{
		this.tagCategories=res.data
	})
  },
  methods: {
    // 检查标签是否已选中
    isSelected(tag) {
      return this.selectedTags.some(selectedTag => 
        selectedTag.id === tag.id //|| selectedTag.name === tag.name
      );
    },
    
    // 切换标签选中状态
    toggleTag(tag) {
      if (this.isSelected(tag)) {
        this.removeTag(tag);
      } else {
        this.addTag(tag);
      }
    },
    
    // 添加标签
    addTag(tag) {
      if (this.selectedTags.length >= this.maxSelect) {
        this.$u.toast(`最多只能选择${this.maxSelect}个标签`);
        return;
      }
      
      if (!this.isSelected(tag)) {
        this.selectedTags.push(tag);
      }
    },
    
    // 移除标签
    removeTag(tag) {
      const index = this.selectedTags.findIndex(selectedTag => 
        selectedTag.id === tag.id || selectedTag.name === tag.name
      );
      if (index > -1) {
        this.selectedTags.splice(index, 1);
      }
    },
    
    // 添加自定义标签
    addCustomTag() {
      const tagName = this.customTagName.trim();
      if (!tagName) {
        this.$u.toast('请输入标签名称');
        return;
      }
      
      // 检查是否已存在
      const exists = this.selectedTags.some(tag => tag.name === tagName) ||
                   this.tagCategories.some(category => 
                     category.tags.some(tag => tag.name === tagName)
                   );
      
      if (exists) {
        this.$u.toast('标签已存在');
        return;
      }
      
      if (this.selectedTags.length >= this.maxSelect) {
        this.$u.toast(`最多只能选择${this.maxSelect}个标签`);
        return;
      }
      
      // 添加自定义标签
      const customTag = {
        id: Date.now(), // 使用时间戳作为临时ID
        name: tagName,
        custom: true
      };
      
      this.selectedTags.push(customTag);
      this.customTagName = '';
      this.$u.toast('添加成功');
    },
    
    // 确认选择
    confirmSelection() {
      this.$emit('confirm', this.selectedTags);
      this.handleClose();
    },
    
    // 打开弹窗
    handleOpen() {
      console.log('弹窗已打开');
    },
    
    // 关闭弹窗
    handleClose() {
      this.show = false;
      this.$emit('input', false);
      this.$emit('close');
    }
  }
}
</script>

<style scoped lang="less">
.tag-selector {
  padding: 30rpx;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  padding-bottom: 30rpx;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.selected-section {
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
}

.section-title, .category-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.content {

  height: 800rpx;
  margin-bottom: 30rpx;
}

.category {
  margin-bottom: 40rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.custom-section {
  padding: 30rpx 0 0 0;
  border-top: 1px solid #f0f0f0;
}

.custom-input-wrapper {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-top: 20rpx;
}

.input-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.custom-input {
  width: 100%;
  height: 70rpx;
  padding: 0 20rpx;
  padding-right: 60rpx;
  border: 2rpx solid #e4e7ed;
  border-radius: 40rpx;
  font-size: 28rpx;
  background-color: #f8f9fa;
  box-sizing: border-box;
}

.custom-input:focus {
  border-color: #3D6AFF;
  background-color: #ffffff;
}

.clear-btn {
  position: absolute;
  right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32rpx;
  height: 32rpx;
}

.add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120rpx;
  height: 70rpx;
  padding: 0 30rpx;
  background-color: #3D6AFF;
  border-radius: 40rpx;
  transition: all 0.2s;
}

.add-button:active {
  background-color: #3D6AFF;
  transform: scale(0.98);
}

.add-button-disabled {
  background-color: #c0c4cc;
  opacity: 0.6;
}

.add-button-text {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 500;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
 
}
::v-deep .u-tag--primary,.u-button--primary {
  background-color: #3D6AFF ;
  border-color: #3D6AFF;
  color: #fff;
}

</style>