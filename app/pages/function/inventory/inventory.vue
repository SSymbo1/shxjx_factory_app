<template>
	<view>
		<u-navbar 
			title="库存表" 
			height="80rpx" 
			leftText="返回" 
			:placeholder="true" 
			fixed 
			@leftClick="returnToHome">
		</u-navbar>
		<view class="content">
			<u-search 
				placeholder="在库存表中搜索,输入件号或件名" 
				v-model="search" 
				:showAction="false"
				@clickIcon="smartSearch"
				@search="smartSearch" 
				style="width: 700rpx; margin: 0 auto;margin-top: 20rpx;">
			</u-search>
			<view class="filter">
				<u-button 
					:plain="true" 
					:text="filterText" 
					icon="arrow-down" 
					style="width: 230rpx;" 
					@click="showFilter">
				</u-button>
			</view>
			<view class="search_result" v-if="inventory.length!==0">
				<uni-swipe-action>
					<uni-swipe-action-item 
						v-for="(i,index) in inventory" 
						:key="index"
						:right-options="options" 
						autoClose
						@click="swipeClick($event,i)">
						<view class="data_card">
							<text style="font-size: 30rpx;margin-left: 20rpx;color: #2979ff;">{{i.name}}</text>
							<text style="position: absolute;left: 250rpx;">原库存:{{i.origin}}</text>
							<text style="position: absolute;left: 500rpx;">现库存:{{i.final}}</text>
						</view>
					</uni-swipe-action-item>
				</uni-swipe-action>
			</view>
			<view class="search_result" v-if="inventory.length===0">
				<view style="margin-left: 20rpx;color: #2979ff;">未在库存表中检索到数据!</view>
			</view>
			<u-action-sheet 
				:actions="list" 
				:title="title" 
				:cancelText="cancel" 
				:show="show" 
				:closeOnClickOverlay="true"
				:closeOnClickAction="true" 
				@close="show=false" @select="selector">
			</u-action-sheet>
			<u-tabbar :value="tabIndex" :fixed="true" :placeholder="true" @change="name => tabIndex = name">
				<u-tabbar-item text="主页" icon="home" @click="tabSelector"></u-tabbar-item>
				<u-tabbar-item text="创建" icon="file-text" @click="tabSelector"></u-tabbar-item>
				<u-tabbar-item text="功能" icon="grid" @click="tabSelector"></u-tabbar-item>
			</u-tabbar>
		</view>
		<u-modal 
			title="删除库存" 
			:show="deleteShow" 
			:showCancelButton="true" 
			@confirm="confirmDelete"
			@cancel="cancelDelete">
			<view class="slot-content">
				<text>是否要删除该条库存数据？</text>
			</view>
		</u-modal>
		<u-modal
			title="更新库存" 
			:show="ifUpdate" 
			:showCancelButton="true" 
			@confirm="update"
			@cancel="closeUpdate">
			<view class="slot-content">
				<view>更新后</view>
				<view>件名:{{initForm.name}}->{{updateForm.name}}</view>
				<view>原库存:{{initForm.origin}}->{{updateForm.origin}}</view>
				<view>现库存:{{initForm.final}}->{{updateForm.final}}</view>
				<view>是否要更新该条库存数据？</view>
			</view>
		</u-modal>
		<u-toast ref="delete_success"></u-toast>
		<u-picker 
			:show="filterShow" 
			title="筛选器"
			:columns="filter" 
			keyName="label" 
			:closeOnClickOverlay="true"
			@close="showFilter"
			@cancel="showFilter" 
			@confirm="confirmFilter">
		</u-picker>
		<u-popup 
			:show="updateShow" 
			mode="center"
			@close="updateClose"
			:round="10"
			closeable>
			<view class="update">
				<view class="update_form">
					<view class="input_item">
						<u--input 
							placeholder="请输入件名/件号,不能为空" 
							shape="circle" 
							v-model="updateForm.name"
							prefixIcon="file-text"
							prefixIconStyle="font-size: 22px;color: #909399"
							clearable 
							style="width: 500rpx; display: inline-block;" 
							@blur="checkName">
						</u--input>
					</view>
					<view class="input_item">
						<u-input 
							placeholder="请输入原库存,不能为空" 
							shape="circle"
							type="number"
							v-model="updateForm.origin"
							prefixIconStyle="font-size: 22px;color: #909399"
							style="width: 500rpx; display: inline-block;" 
							@blur="checkOrigin">
							<u-text 
								text="原库存" 
								slot="prefix" 
								margin="0 0 0 0"
								type="tips">
							</u-text>
						</u-input>
					</view>
					<view class="switch_item">
						<text style="margin-right: 15rpx;">以原库存量计算</text>
						<u-switch 
							v-model="calculateMode" 
							activeColor="#5ac731" 
							inactiveColor="#f56c6c">
						</u-switch>
					</view>
					<view class="input_item">
						<u-input 
							placeholder="请输入进货量" 
							shape="circle"
							type="number"
							v-model="updateForm.in"
							prefixIconStyle="font-size: 22px;color: #909399"
							@blur="autoPlus"
							style="width: 500rpx; display: inline-block;">
							<u-text
								text="进货量" 
								slot="prefix" 
								margin="0 0 0 0"
								type="tips">
							</u-text>
						</u-input>
					</view>
					<view class="input_item">
						<u-input 
							placeholder="请输入出货量" 
							shape="circle"
							type="number"
							v-model="updateForm.out"
							prefixIconStyle="font-size: 22px;color: #909399"
							@blur="autoReduce"
							style="width: 500rpx; display: inline-block;">
							style="width: 500rpx; display: inline-block;">
							<u-text
								text="出货量" 
								slot="prefix" 
								margin="0 0 0 0"
								type="tips">
							</u-text>
						</u-input>
					</view>
					<view class="input_item">
						<u-input 
							placeholder="请输入现库存,不能为空,默认为原库存" 
							shape="circle" 
							type="number"
							v-model="updateForm.final"
							prefixIconStyle="font-size: 22px;color: #909399"
							style="width: 500rpx; display: inline-block;" 
							@blur="checkFinal">
							<u-text
								text="现库存" 
								slot="prefix" 
								margin="0 0 0 0"
								type="tips">
							</u-text>
						</u-input>
					</view>
					<view class="button_item">
						<u-button 
							class="create_btn" 
							type="primary" 
							text="修改" 
							shape="circle" 
							icon="checkmark" 
							style="width: 180rpx;" 
							@click="confirmUpdate">
						</u-button>
						<u-button 
							class="reset_btn" 
							type="error" 
							text="重置" 
							shape="circle" 
							icon="trash" 
							style="width: 180rpx;" 
							@click="resetUpdate">
						</u-button>
					</view>
				</view>
			</view>
		</u-popup>
		<u-notify ref="check_warn"></u-notify>
		<u-toast ref="update_success"></u-toast>
	</view>
</template>

<script>
	import {
		openDb,
		closeDb,
		isOpened,
		sqlName,
		sqlPath
	} from '@/static/js/sqlite_helper.js'
	import {
		selectInventoryByCondition,
		deleteInventory,
		selectInventoryOrderByName,
		selectInventoryOrderByOrigin,
		selectInventoryOrderByFinal,
		updateInventory,
		updateInventoryDelOpt
	} from '@/static/js/crud.js'
	export default {
		data() {
			return {
				search: '',
				tabIndex: 0,
				show: false, //操作菜单是否显示
				cancel: '取消', //取消按钮名称
				title: '创建什么类型的电子单？', //操作菜单的标题
				deleteShow: false,
				filterShow:false,
				updateShow:false,
				ifUpdate:false,
				calculateMode:false,
				reduceLock:false,
				plusLock:false,
				inventory: [],
				deleteId: '',
				filterText:'默认',
				options: [
					{
						text: '修改',
						style: {
							backgroundColor: '#2979ff'
						},
					},
					{
						text: '删除',
						style: {
							backgroundColor: '#dd524d'
						},
					}
				],
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
					},
				],
				filter:[
					[
						{
							label:'默认',
							id:0
						},
						{
							label:'件名(升序)',
							id:1
						},
						{
							label:'件名(降序)',
							id:2
						},
						{
							label:'原库存(升序)',
							id:3
						},
						{
							label:'原库存(降序)',
							id:4
						},
						{
							label:'现库存(升序)',
							id:5
						},
						{
							label:'现库存(降序)',
							id:6
						},
					]
				],
				plusCache:0,
				reduceCache:0,
				initForm:{
					name:'',
					origin:'',
					in:'',
					out:'',
					final:'',
				},
				updateForm:{
					id:'',
					name:'',
					origin:'',
					in:'',
					out:'',
					final:'',
				},
				check:[false,false,false,false,false,false,false],
			}
		},
		onLoad() {
			this.smartSearch()
		},
		methods: {
			smartSearch() {
				if (!isOpened(sqlName, sqlPath)) {
					openDb(sqlName, sqlPath)
				}
				selectInventoryByCondition(this.search).then(res => {
					this.inventory = res
					this.filterText='默认'
				})
				closeDb(sqlName)
			},
			tabSelector(e) {
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
			selector(e) { //操作菜单点击监听器
				console.log("操作菜单选择：" + e.id);
				if (e.id === 0) {
					uni.$u.route({
						url: '/pages/function/quotation/create_quotation',
						type: 'redirect'
					})
				} else if (e.id === 1) {
					uni.$u.route({
						url: '/pages/function/inventory/create_inventory',
						type: 'redirect'
					})
				}
			},
			returnToHome() {
				uni.$u.route({
					url: '/pages/index/index',
					type: 'redirect'
				})
			},
			deleteInventory(del) {
				console.log("删除元素:" + del);
				this.deleteId = del
				this.deleteShow = !this.deleteShow
			},
			confirmDelete() {
				let date=new Date().getTime()
				let opt_time=uni.$u.timeFormat(opt_time,'yyyy-mm-dd')
				if (!isOpened(sqlName, sqlPath)) {
					openDb(sqlName, sqlPath)
				}
				deleteInventory(this.deleteId).then(res => {
					if (JSON.stringify(res) === '{}') {
						this.$refs.delete_success.show({
							message: '删除成功!',
							type: 'success'
						})
						updateInventoryDelOpt(this.deleteId,opt_time).then(res=>{
							if (JSON.stringify(res) === '{}') {
								this.deleteId = ''
								this.search = ''
								this.deleteShow = !this.deleteShow
								this.smartSearch()
							}
						})
					}
				})
			},
			cancelDelete() {
				this.deleteShow = !this.deleteShow
				this.deleteId = ''
			},
			showFilter(){
				this.filterShow=!this.filterShow
			},
			updateClose(){
				this.updateShow=!this.updateShow
				this.resetUpdate()
			},
			confirmFilter(e){
				if(!isOpened(sqlName,sqlPath)){
					openDb(sqlName,sqlPath)
				}
				switch(e.indexs[0]){
					case 0:
						this.filterText='默认'
						selectInventoryByCondition(this.search).then(res=>{
							this.inventory=res
						})
						break
					case 1:
						this.filterText='件名(升序)'
						selectInventoryOrderByName(this.search,'asc').then(res=>{
							this.inventory=res
						})
						break
					case 2:
						this.filterText='件名(降序)'
						selectInventoryOrderByName(this.search,'desc').then(res=>{
							this.inventory=res
						})
						break
					case 3:
						this.filterText='原库存(升序)'
						selectInventoryOrderByOrigin(this.search,'asc').then(res=>{
							this.inventory=res
						})
						break
					case 4:
						this.filterText='原库存(降序)'
						selectInventoryOrderByOrigin(this.search,'desc').then(res=>{
							this.inventory=res
						})
						break
					case 5:
						this.filterText='现库存(升序)'
						selectInventoryOrderByFinal(this.search,'asc').then(res=>{
							this.inventory=res
						})
						break
					case 6:
						this.filterText='现库存(降序)'
						selectInventoryOrderByFinal(this.search,'desc').then(res=>{
							this.inventory=res
						})
						break
				}
				closeDb(sqlName)
				this.showFilter()
			},
			swipeClick(e,obj){
				if(e.index===0){
					this.initForm.name=obj.name
					this.initForm.origin=obj.origin
					this.initForm.in=obj.in
					this.initForm.out=obj.out
					this.initForm.final=obj.final
					this.updateForm.id=obj.iid
					this.updateForm.name=obj.name
					this.updateForm.origin=obj.origin
					this.updateForm.in=obj.in
					this.updateForm.out=obj.out
					this.updateForm.final=obj.final
					this.updateShow=!this.updateShow
				}else if(e.index===1){
					this.deleteInventory(obj.iid)
				}
			},
			resetUpdate(){
				this.calculateMode=false
				this.updateForm.name=this.initForm.name
				this.updateForm.origin=this.initForm.origin
				this.updateForm.in=this.initForm.in
				this.updateForm.out=this.initForm.out
				this.updateForm.final=this.initForm.final
				this.plusCache=0
				this.reduceCache=0
				this.plusLock=false
				this.reduceLock=false
			},
			autoPlus(){
				let flag=false
				if((this.updateForm.in===undefined||this.updateForm.in==='')&&this.updateForm.plusCache!==0&&this.plusLock===false){
					if(Number(this.updateForm.final)-this.plusCache<0){
						this.updateForm.final=0
					}else{
						this.updateForm.final=Number(this.updateForm.final)-this.plusCache
					}
					flag=true
					this.plusLock=true
				}else if(this.updateForm.in===undefined||this.updateForm.in===''){
					flag=true
					this.plusLock=true
				}
				if(flag==false){
					this.plusCache=Number(this.updateForm.in)
					if(this.calculateMode===false){
						this.updateForm.final=Number(this.updateForm.final)+Number(this.updateForm.in)
					}else{
						this.updateForm.final=Number(this.updateForm.origin)+Number(this.updateForm.in)
					}
					this.plusLock=false
				}
				this.checkIn()
			},
			autoReduce(){
				let flag=false
				if((this.updateForm.reduceCache!==0)&&(this.reduceLock===false)&&(this.updateForm.out===undefined||this.updateForm.out==='')){
					this.updateForm.final=Number(this.updateForm.final)+this.reduceCache
					flag=true
					this.reduceLock=true
				}else if(this.updateForm.out===undefined||this.updateForm.out===''){
					flag=true
					this.reduceLock=true
				}
				if(flag==false){
					this.reduceCache=Number(this.updateForm.out)
					if(this.calculateMode===false){
						if(Number(this.updateForm.final)-Number(this.updateForm.out)<0){
							this.updateForm.final=0
						}else{
							this.updateForm.final=Number(this.updateForm.final)-Number(this.updateForm.out)
						}
					}else{
						if(Number(this.updateForm.origin)-Number(this.updateForm.out)<0){
							this.updateForm.final=0
						}else{
							this.updateForm.final=Number(this.updateForm.final)-Number(this.updateForm.out)
						}
					}
					this.reduceLock=false
				}
				this.checkOut()
			},
			confirmUpdate(){
				let nullUpdateWarn=''
				let smallThenZeroWarn=''
				this.checkName()
				this.checkOrigin()
				this.checkIn()
				this.checkOut()
				this.checkFinal()
				if(!this.check.every(item=>item===false)){
					if(this.check[0]===true){
						nullUpdateWarn=nullUpdateWarn+'件名,'
					}
					if(this.check[1]===true){
						nullUpdateWarn=nullUpdateWarn+'原库存,'
					}
					if(this.check[2]===true){
						smallThenZeroWarn=smallThenZeroWarn+'原库存,'
					}
					if(this.check[3]===true){
						smallThenZeroWarn=smallThenZeroWarn+'进货量,'
					}
					if(this.check[4]===true){
						smallThenZeroWarn=smallThenZeroWarn+'出货量,'
					}
					if(this.check[5]===true){
						nullUpdateWarn=nullUpdateWarn+'现库存'
					}
					if(this.check[6]===true){
						smallThenZeroWarn=smallThenZeroWarn+'现库存'
					}
					if(nullUpdateWarn!==''){
						nullUpdateWarn=nullUpdateWarn+'不能为空!'
						this.$refs.check_warn.show({
							message:nullUpdateWarn,
							type:'warning',
							safeAreaInsetTop:true
						})
					}
					if(smallThenZeroWarn!==''){
						smallThenZeroWarn=smallThenZeroWarn+'不能小于零!'
						this.$refs.check_warn.show({
							message:smallThenZeroWarn,
							type:'warning',
							safeAreaInsetTop:true
						})
					}
				}else{
					this.updateShow=!this.updateShow
					this.ifUpdate=!this.ifUpdate
				}
			},
			checkName(){
				if(this.updateForm.name===undefined||this.updateForm.name===''){
					this.$refs.check_warn.show({
						message:'件名不能为空!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[0]=true
				}else{
					this.check[0]=false
				}
			},
			checkOrigin(){
				if(this.updateForm.origin===undefined||this.updateForm.origin===''){
					this.$refs.check_warn.show({
						message:'原库存不能为空!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[1]=true
				}else if(Number(this.updateForm.origin)<0){
					this.$refs.check_warn.show({
						message:'原库存不能小于等于零!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[2]=true
				}else{
					this.check[1]=false
					this.check[2]=false
				}
			},
			checkIn(){
				if(Number(this.updateForm.in)<0){
					this.$refs.check_warn.show({
						message:'进货量不能小于零!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[3]=true
				}else{
					this.check[3]=false
				}
			},
			checkOut(){
				if(Number(this.updateForm.out)<0){
					this.$refs.check_warn.show({
						message:'出货量不能小于零!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[4]=true
				}else{
					this.check[4]=false
				}
			},
			checkFinal(){
				if(this.updateForm.final===undefined||this.updateForm.final===''){
					this.$refs.check_warn.show({
						message:'现库存不能为空!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[5]=true
				}else if(Number(this.updateForm.final)<0){
					this.$refs.check_warn.show({
						message:'现库存不能小于等于零!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[6]=true
				}else{
					this.check[5]=false
					this.check[6]=false
				}
			},
			closeUpdate(){
				this.ifUpdate=!this.ifUpdate
				this.updateShow=!this.updateShow
			},
			update(){
				let date=new Date().getTime()
				let opt_time=uni.$u.timeFormat(opt_time,'yyyy-mm-dd')
				if(!isOpened(sqlName,sqlPath)){
					openDb(sqlName,sqlPath)
				}
				if(this.updateForm.in===undefined){
					this.updateForm.in=0
				}
				if(this.updateForm.out===undefined){
					this.updateForm.out=0
				}
				updateInventory(this.updateForm.id,this.updateForm.name,this.updateForm.origin,this.updateForm.in,this.updateForm.out,this.updateForm.final,opt_time).then(res=>{
					if(JSON.stringify(res)==='{}'){
						this.resetUpdate()
						this.ifUpdate=!this.ifUpdate
						this.smartSearch()
						this.$refs.update_success.show({
							message:'库存更新成功!',
							type:'success'
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.content {
		margin-top: 20rpx;
	}
	.search_result {
		margin-top: 10rpx;
	}
	.data_card {
		height: 80rpx;
		line-height: 80rpx;
		border-bottom: 1rpx solid #909399;
	}
	.filter{
		margin-top: 20rpx;
	}
	.update{
		width: 600rpx;
		height: 750rpx;
	}
	.button_item{
		width: 400rpx;
		margin-top: 20rpx;
		display: flex; 
		justify-content: center;
		position: absolute;
		left: 50%;  
		transform: translateX(-50%);  
	}
	.input_item{
		margin-top: 20rpx;
		text-align: center;
	}
	.update_form{
		margin-top: 80rpx;
	}
	.switch_item{
		display: flex;
		justify-content: center;
		position: relative;
		margin-top: 20rpx;
	}
</style>