<template>
    <div class="image-upload-content">
		
		<div class="image-wrap" v-for="(item, index) in fileList" :key="index">
			<image 
				class="image" 
				mode="aspectFill" 
				:src="item.filePath"
				@click="openImageViewer"
			></image>
			<!-- 进度条 -->
			<view v-if="item.progress < 100" class="progress-wrap">
				<text class="progress">{{ item.progress }}%</text>
			</view>
			<!-- 操作项 -->
			<view class="options">
				<i class="el-icon-zoom-in" @click="openImageViewer"></i>
				<i class="el-icon-delete" @click="deleteFile(index)"></i>
			</view>
		</div>
		<!-- 新增按钮 -->
		<div v-if="fileList.length < count" class="add-btn" @click="chooseImage">
			<i class="el-icon-plus"></i>
		</div>
		<!-- 查看大图 -->
		<el-image-viewer 
			v-if="showImageViewer" 
			:on-close="closeImageViewer" 
			:url-list="fileList.map(v=>v.filePath)" 
		></el-image-viewer>
    </div>
</template>

<script>
	import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
	import {uploadFileInChunks } from './upload.js' 
    export default {
        name: 'MixImageUpload',
		components: { ElImageViewer },
        data(){
            return {
				showImageViewer: false,
                fileList: []
            }
        },
        props: {
			files: {
				type: Array,
				default(){
					return [];
				}
			},
            count: {
                type: Number,
                default: 1
            },
			index: {
				type: Number,
				default: 0
			}
        },
        created() {
			setTimeout(()=>{
				this.fileList = this.files.map(item=>{
					return {
						filePath: item,
						url: item
					}
				})
			}, 500)
        },
        methods: {
			/* 预览 */
			openImageViewer(){
				this.showImageViewer = true;
			},
			/* 关闭预览 */
			closeImageViewer(){
				this.showImageViewer = false;
			},
			chooseImage(){
				uni.chooseImage({
					count: this.count - this.fileList.length,
					sizeType: ['original', 'compressed'], // 支持原图和压缩图
					sourceType: ['album', 'camera'], // 支持相册和相机
					success: res => {
						const files = res.tempFiles;
						for(let i = 0; i < files.length; i++){
							if(this.fileList.length >= this.count){
								this.$message.error('最多上传' + this.count + '张图片');
								return;
							}
							
							// 检查文件大小（限制为10MB）
							if (files[i].size > 10 * 1024 * 1024) {
								this.$message.error('图片大小不能超过10MB');
								continue;
							}
							
							// 检查文件类型
							const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
							if (!allowedTypes.includes(files[i].type)) {
								this.$message.error('只支持 JPG、PNG、GIF、WebP 格式的图片');
								continue;
							}
							
							this.fileList.push({
								progress: 0,
								filePath: files[i].path,
								url: files[i].path
							});
							this.upload(files[i], this.fileList.length - 1);
						}
					},
					fail: err => {
						console.error('选择图片失败:', err);
						this.$message.error('选择图片失败');
					}
				})
			},
			/**
			 * 上传图片
			 */
			async upload(file, index){
				try {
					// 使用 uploadFileInChunks 上传文件
					const result = await uploadFileInChunks(file, {
						onProgress: (percent) => {
							// 更新上传进度
							this.fileList[index].progress = Math.round(percent);
							uni.showLoading({ title: `上传中 ${Math.round(percent)}%` });
						}
					});
					
					// 上传完成
					uni.hideLoading();
					console.log('上传完成:', result);
					
					// 更新文件信息
					if (result && result.code === 200) {
						// 如果文件已存在，使用返回的filePath
						if (result.filePath) {
							this.fileList[index].url = result.filePath;
							this.fileList[index].filePath = result.filePath;
						}
						this.fileList[index].progress = 100;
						
						// 触发父组件更新
						this.$emit('onChanged', this.fileList.map(item => item.url), this.index);
					} else {
						throw new Error(result.message || '上传返回数据格式错误');
					}
					
				} catch (error) {
					console.error('上传失败:', error);
					uni.hideLoading();
					
					// 显示错误提示
					this.$message.error(error.message || '图片上传失败，请重试');
					
					// 移除上传失败的文件
					this.fileList.splice(index, 1);
				}
			},
			deleteFile(index){
				this.fileList.splice(index, 1);
				this.$emit('onChanged', this.fileList.map(item=> item.url), this.index);
			}
        }
    }
</script>

<style scoped lang="scss">
	.image-upload-content{
		display: flex;
		flex-wrap: wrap;
	}
	.image-wrap, .add-btn{
		width: 80px;
		height: 80px;
		margin-bottom: 8px;
	}
	.image-wrap{
		margin-right: 8px;
		position: relative;
		border-radius: 6px;
		overflow: hidden;
		
		.image{
			width: 100%;
			height: 100%;
		}
		.progress-wrap, .options{
			position: absolute;
			left: 0;
			top: 0;
			z-index: 15;
			width: 100%;
			height: 100%;
			background-color: rgba(0,0,0,.5);
		}
		.progress-wrap{
			font-size: 12px;
			color: #fff;
			line-height: 80px;
			text-align: center;
		}
		.options{
			line-height: 80px;
			text-align: center;
			opacity: 0;
			
			&:hover{
				opacity: 1;
			}
			i{
				padding: 6px;
				font-size: 17px;
				color: #fff;
			}
		}
	}
	.add-btn{
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fbfdff;
		border: 1px dashed #c0ccda;
		border-radius: 6px;
		
		i{
			font-size: 28px;
			color: #8c939d;
		}
	}
	::v-deep .el-icon-circle-close{
		color: #fff;
		font-size: 24px;
	}
	::v-deep .el-image-viewer__mask{
		opacity: .7;
	}
</style>
