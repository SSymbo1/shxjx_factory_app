<template>
	<view>
		<view class="content">
			<view class="welcome_word">
				<view style="font-size: 50rpx;">{{welcome}}</view>
				<view style="font-size: 32rpx; margin-top: 15rpx;">{{slogn}}</view>
			</view>
			<u-divider text="摘要"></u-divider>
			<view class="warn">
				<view class="abstract_container">
					<u-icon name="error-circle" color="#ff8901" size="25"></u-icon>
					<span style="margin-left: 10rpx;margin-top: -5rpx;">目前库存量最低的是:{{warnGoods}}</span>
				</view>
				<view class="abstract_container">
					<u-icon name="clock" color="#2979ff" size="25"></u-icon>
					<span style="margin-left: 10rpx;margin-top: -5rpx;">最后一次更新库存表时间:{{lastUpdateTimeInventory}}</span>
				</view>
				<view class="abstract_container">
					<u-icon name="clock" color="#2979ff" size="25"></u-icon>
					<span style="margin-left: 10rpx;margin-top: -5rpx;">最后一次更新报价单时间:{{lastUpdateTimeQuotation}}</span>
				</view>
			</view>
			<u-divider text="功能区"></u-divider>
			<u-search placeholder="请输入搜索内容,例如件号或件名" v-model="search" :showAction="false" @clickIcon="smartSearch"
				@search="smartSearch" style="width: 700rpx; margin: 0 auto;">
			</u-search>
			<u-grid class="fun_selecter" :border="true">
				<u-grid-item v-for="(f,index) in fun" :key="index" @click="gridSelector">
					<u-icon :customStyle="{paddingTop:20+'rpx'}" :name="f.icon" :size="30"></u-icon>
					<view class="grid-text">{{f.name}}</view>
				</u-grid-item>
			</u-grid>
			<u-action-sheet :actions="list" :title="title" :cancelText="cancel" :show="show" :closeOnClickOverlay="true"
				:closeOnClickAction="true" @close="show=false" @select="selector">
			</u-action-sheet>
			<u-popup :show="searchShow" mode="top" @close="smartSearchClose" closeable>
				<view class="smart_search_show">
					<u-divider text="库存表" textPosition="left"></u-divider>
					<view :style="{height:listHeightI}" v-if="inventory.length!==0">
						<view class="data_card" v-for="(i,index) in inventory" :key="index">
							<text class="res_title">{{i.name}}</text>
							<text style="margin-left: 50rpx;">库存:{{i.final}}</text>
						</view>
					</view>
					<view :style="{height:'30rpx'}" v-if="inventory.length===0">
						<view style="margin-left: 20rpx;">无搜索结果</view>
					</view>
					<u-divider text="报价单" textPosition="left"></u-divider>
					<view :style="{height:listHeightQ}" v-if="quotation.length!==0">
						<view class="data_card" v-for="(q,index) in quotation" :key="index">
							<text class="res_title">{{q.c_name}}</text>
							<text style="margin-left: 50rpx;">本价:{{q.base_price}}</text>
							<text style="margin-left: 50rpx;">现价:{{q.price}}</text>
						</view>
					</view>
					<view :style="{height:'50rpx'}" v-if="quotation.length===0">
						<view style="margin-left: 20rpx;">无搜索结果</view>
					</view>
				</view>
			</u-popup>
			<u-notify ref="search_null_warn"></u-notify>
			<u-notify ref="create_success"></u-notify>
			<u-tabbar :value="tabIndex" :fixed="true" :placeholder="true" @change="name => tabIndex = name">
				<u-tabbar-item text="主页" icon="home" @click="tabSelector"></u-tabbar-item>
				<u-tabbar-item text="创建" icon="file-text" @click="tabSelector"></u-tabbar-item>
				<u-tabbar-item text="功能" icon="grid" @click="tabSelector"></u-tabbar-item>
			</u-tabbar>
		</view>
	</view>
</template>

<script>
	import {
		selectLastUpdateQuotation,
		selectLastUpdateInventory,
		selectInventoryWarn,
		selectInventoryByCondition,
		selectQuotationByCondition
	} from '@/static/js/crud.js';
	import {
		sqlName,
		sqlPath,
		isOpened,
		openDb,
		closeDb
	} from '@/static/js/sqlite_helper.js'
	import {xlsBulider,fileNamePath} from '@/static/js/export_xls.js'
	export default {
		data() {
			return {
				welcome: '', //欢迎词
				slogn: '', //标语
				show: false, //操作菜单是否显示
				searchShow: false,
				cancel: '取消', //取消按钮名称
				title: '创建什么类型的电子单？', //操作菜单的标题
				tabIndex: 0, //导航栏索引
				search: '', //搜索栏内容
				warnGoods: 'default', //库存量警告
				lastUpdateTimeInventory: '1970-01-01', //最后更新库存表时间
				lastUpdateTimeQuotation: '1970-01-01', //最后更新报价单时间
				listHeightI: 0,
				listHeightQ: 0,
				quotation: [],
				inventory: [],
				list: [
					//操作菜单选项
					{
						id: 0,
						name: '创建新的报价',
						subname: '在报价单内创建一个新的报价字段'
					},
					{
						id: 1,
						name: '创建新的库存',
						subname: '在库存表内创建一个新的库存字段'
					}
				],
				fun: [
					//九宫格内容
					{
						icon: 'shopping-cart',
						name: '库存表'
					},
					{
						icon: 'order',
						name: '报价单'
					},
					{
						icon: 'share-square',
						name: '生成报价单'
					},
					{
						icon: 'more-dot-fill',
						name: '敬请期待'
					}
				]
			}
		},
		onLoad() {
			this.getWelcome()
			this.getPersistenceData()
		},
		methods: {
			getWelcome() { //根据时间显示标题和问候语
				let date = new Date();
				if ((date.getHours() >= 2 && date.getHours() < 4) || (date.getHours() >= 22 || date.getHours() < 2)) {
					this.slognSetter('还没睡码？', '夜深人静，好好休息。')
				} else if (date.getHours() >= 4 && date.getHours() < 7) {
					this.slognSetter("早上好！", '新的一天，新的开始。')
				} else if (date.getHours() >= 7 && date.getHours() < 10) {
					this.slognSetter('上午好！', '精神饱满，迎接挑战。')
				} else if (date.getHours() >= 10 && date.getHours() < 14) {
					this.slognSetter('中午好！', '休息一下，为下午充电。')
				} else if (date.getHours() >= 14 && date.getHours() < 20) {
					this.slognSetter('下午好！', '体力充沛，全力以赴。')
				} else if (date.getHours() >= 20 && date.getHours() < 22) {
					this.slognSetter('晚上好！', '放松心情，享受夜晚。')
				}
			},
			slognSetter(welcome, slogn) { //设置标题问候语
				this.slogn = slogn
				this.welcome = welcome
			},
			selector(e) { //操作菜单点击监听器
				console.log("操作菜单选择：" + e.id);
				if(e.id===0){
					uni.$u.route({
						url: '/pages/function/quotation/create_quotation',
						type: 'redirect'
					})
				}else if(e.id===1){
					uni.$u.route({
						url: '/pages/function/inventory/create_inventory',
						type: 'redirect'
					})
				}
			},
			tabSelector(e) { //导航菜单点击监听器
				if (e === 1) {
					this.show = !this.show
				} else if (e === 0) {
					uni.$u.route({
						url: '/pages/index/index',
						type: 'redirect'
					})
				}
				console.log("底部导航栏选择：" + e);
			},
			gridSelector(name) { //九宫格点击监听器
				if (name === 0) {
					uni.$u.route({
						url: '/pages/function/inventory/inventory',
						type: 'redirect'
					})
				} else if (name === 1) {
					uni.$u.route({
						url: '/pages/function/quotation/quotation',
						type: 'redirect'
					})
				} else if (name === 2) {
					if(!isOpened(sqlName,sqlPath)){
						openDb(sqlName,sqlPath)
					}
					let datas=[]
					selectQuotationByCondition('').then(res=>{
						datas=res
						if(datas.length!=0){
							closeDb(sqlName)
							xlsBulider().then(res=>{
								this.$refs.create_success.success('生成报价单成功!')
								const FileShare=uni.requireNativePlugin('life-FileShare')
								FileShare.render({
									type:"SYSTEM",
									filePath:plus.io.convertLocalFileSystemURL(fileNamePath),},
									result=>{
										this.$refs.create_success.success('请选择分享到的平台')
										console.log(result);
									}
								)
							}).catch(e=>{
								console.log('执行错误!'+e);
							})
						}else{
							this.$refs.search_null_warn.warning('报价单为空，无法导出!')
						}
					})
				}
				console.log('点击九宫格:' + name);
			},
			smartSearch() { //主页面搜索功能
				if (this.search !== '') {
					if (!isOpened(sqlName, sqlPath)) {
						openDb(sqlName, sqlPath)
					}
					selectInventoryByCondition(this.search).then(res => {
						this.inventory = res
						this.listHeightI = this.inventory.length * 80
					})
					selectQuotationByCondition(this.search).then(res => {
						this.quotation = res
						this.listHeightQ = this.quotation * 80 + 20
					})
					closeDb(sqlName)
					this.searchShow = !this.searchShow
					console.log("已触发搜索功能，输入框内容为：" + this.search);
				}else{
					this.$refs.search_null_warn.warning('请输入搜索内容!')
				}

			},
			smartSearchClose() { //关闭搜索结果栏
				this.searchShow = false
			},
			getPersistenceData() { //获取摘要数据
				if (!isOpened(sqlName, sqlPath)) {
					openDb(sqlName, sqlPath)
				}
				selectLastUpdateQuotation().then(res => {
					this.lastUpdateTimeQuotation = res[0].opt_time
				})
				selectLastUpdateInventory().then(res => {
					this.lastUpdateTimeInventory = res[0].opt_time
				})
				selectInventoryWarn().then(res => {
					this.warnGoods = res[0].name
				})
				closeDb(sqlName)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.grid-text {
		font-size: 14px;
		color: #909399;
		padding: 10rpx 0 20rpx 0rpx;
		/* #ifndef APP-PLUS */
		box-sizing: border-box;
		/* #endif */
	}
	.fun_selecter {
		margin-top: 50rpx;
	}
	.welcome_word {
		margin-left: 25rpx;
		margin-top: 50rpx;
	}
	.warn {
		margin-left: 25rpx;
		margin-top: 40rpx;
	}
	.abstract_container {
		display: flex;
		align-items: center;
		margin-top: 20rpx;
	}
	.smart_search_show {
		margin-top: 20rpx;
	}
	.content {
		margin-top: 20rpx;
	}
	.data_card {
		margin-top: 10rpx;
		border-style: solid;
		border-color: #edeef2;
		height: 80rpx;

	}
	.res_title {
		font-size: 30rpx;
		margin-left: 20rpx;
		line-height: 80rpx;
	}
</style>