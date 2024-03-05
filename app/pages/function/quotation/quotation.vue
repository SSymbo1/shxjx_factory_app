<template>
	<view>
		<u-navbar
			title="报价单" 
			height="80rpx" 
			leftText="返回" 
			:placeholder="true" 
			fixed 
			@leftClick="returnToHome">
		</u-navbar>
		<view class="content">
			<u-search 
				placeholder="在报价单中搜索,输入件号或件名" 
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
			<view class="search_result" v-if="quotation.length!==0">
				<uni-swipe-action>
					<uni-swipe-action-item
						v-for="(q,index) in quotation" :key="index"
						:right-options="options" 
						autoClose
						@click="swipeClick($event,q)">
						<view class="data_card">
							<text style="font-size: 30rpx;margin-left: 20rpx;color: #2979ff;">{{q.c_name}}</text>
							<text style="position: absolute;left: 250rpx;">本价:{{q.base_price}}元</text>
							<text style="position: absolute;left: 450rpx;">现价:{{q.price}}元</text>
						</view>
					</uni-swipe-action-item>
				</uni-swipe-action>
			</view>
			<view class="search_result" v-if="quotation.length===0">
				<view style="margin-left: 20rpx;color: #2979ff;">未在报价单中检索到数据!</view>
			</view>
			<u-action-sheet 
				:actions="list" 
				:title="title" 
				:cancelText="cancel" 
				:show="show" 
				:closeOnClickOverlay="true"
				:closeOnClickAction="true" 
				@close="show=false" 
				@select="selector">
			</u-action-sheet>
			<u-tabbar :value="tabIndex" :fixed="true" :placeholder="true" @change="name => tabIndex = name">
				<u-tabbar-item text="主页" icon="home" @click="tabSelector"></u-tabbar-item>
				<u-tabbar-item text="创建" icon="file-text" @click="tabSelector"></u-tabbar-item>
				<u-tabbar-item text="功能" icon="grid" @click="tabSelector"></u-tabbar-item>
			</u-tabbar>
		</view>
		<u-modal
			title="删除报价" 
			:show="deleteShow" 
			:showCancelButton="true" 
			@confirm="confirmDelete" 
			@cancel="cancelDelete">
			<view class="slot-content">
				<text>是否要删除该条报价数据？</text>
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
				<view>件名:{{initQuoqtqion.name}}->{{updateQuotation.name}}</view>
				<view>旧件号:{{initQuoqtqion.old_part}}->{{updateQuotation.old_part}}</view>
				<view>新件号:{{initQuoqtqion.new_part}}->{{updateQuotation.new_part}}</view>
				<view>基本价:{{initQuoqtqion.base}}->{{updateQuotation.base}}</view>
				<view>折率:{{initQuoqtqion.rate}}->{{updateQuotation.rate}}</view>
				<view>现价:{{initQuoqtqion.price}}->{{updateQuotation.price}}</view>
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
							placeholder="请输入件名,不能为空" 
							shape="circle" 
							v-model="updateQuotation.name" 
							prefixIcon="file-text"
							prefixIconStyle="font-size: 22px;color: #909399" 
							clearable 
							@change="autoInsertOld"
							@blur="checkName"
							style="width: 500rpx; display: inline-block;">
						</u--input>
					</view>
					<view class="input_item">
						<u-input 
							placeholder="请输入旧件号,不能为空" 
							shape="circle" 
							v-model="updateQuotation.old_part" 
							prefixIcon="file-text"
							prefixIconStyle="font-size: 22px;color: #909399" 
							clearable 
							style="width: 500rpx; display: inline-block;" 
							@blur="checkOld">
							<u-text
								text="旧件号" 
								slot="prefix" 
								margin="0 0 0 0"
								type="tips">
							</u-text>
						</u-input>
					</view>
					<view class="switch_item">
						<text style="margin-right: 15rpx;">新件号</text>
						<u-switch 
							v-model="isOpenNew" 
							activeColor="#5ac731" 
							inactiveColor="#f56c6c">
						</u-switch>
					</view>
					<view class="input_item">
						<u-input 
							placeholder="新件号开启时不能为空" 
							shape="circle" 
							v-model="updateQuotation.new_part" 
							prefixIcon="file-text"
							prefixIconStyle="font-size: 22px;color: #909399" 
							clearable 
							:disabled="!isOpenNew"
							style="width: 500rpx; display: inline-block;" 
							@blur="checkNew">
							<u-text
								text="新件号" 
								slot="prefix" 
								margin="0 0 0 0"
								type="tips">
							</u-text>
						</u-input>
					</view>
					<view class="input_item">
						<u-input 
							placeholder="请输入基本价,不能为空" 
							shape="circle" 
							type="number"
							v-model="updateQuotation.base" 
							prefixIconStyle="font-size: 22px;color: #909399" 
							style="width: 500rpx; display: inline-block;" 
							@blur="checkBase">
							<u-text
								text="基本价" 
								slot="prefix" 
								margin="0 0 0 0"
								type="tips">
							</u-text>
						</u-input>
					</view>
					<view class="number_box_item">
						<text style="margin-right: 15rpx;">折率</text>
						<u-number-box 
							v-model="updateQuotation.rate" 
							:step="0.10" 
							:max="1" 
							:min='-0.99' 
							decimal-length="2" 
							:blur="autoCalculate()">
						</u-number-box>
					</view>
					<view class="input_item">
						<u-input 
							placeholder="请输入现价,不能为空" 
							shape="circle" 
							type="number"
							v-model="updateQuotation.price" 
							prefixIconStyle="font-size: 22px;color: #909399" 
							style="width: 500rpx; display: inline-block;" 
							@blur="checkPrice">
							<u-text
								text="现价" 
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
							text="更新" 
							shape="circle" 
							icon="checkmark"
							@click="confirmUpdate" 
							style="width: 180rpx;">
						</u-button>
						<u-button 
							class="reset_btn" 
							type="error" 
							text="重置" 
							shape="circle" 
							icon="trash" 
							style="width: 180rpx;"
							@click="resetQuotation">
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
		sqlPath,
		} from '@/static/js/sqlite_helper.js'
	import {
		selectQuotationByCondition,
		deleteQuotation,
		selectQuotationOrderByName,
		selectQuotationOrderByBase,
		selectQuotationOrderByPrice,
		updateQuotation,
		updateQuotationHaveNew,
		updateQuotationDelOpt
		} from '@/static/js/crud.js'
	export default {
		data() {
			return {
				search: '',
				tabIndex: 0,
				show: false, //操作菜单是否显示
				cancel: '取消', //取消按钮名称
				title: '创建什么类型的电子单？', //操作菜单的标题
				deleteShow:false,
				filterShow:false,
				updateShow:false,
				isOpenNew:false,
				ifUpdate:false,
				quotation:[],
				deleteId:'',
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
					}
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
							label:'基本价(升序)',
							id:3
						},
						{
							label:'基本价(降序)',
							id:4
						},
						{
							label:'现价(升序)',
							id:5
						},
						{
							label:'现价(降序)',
							id:6
						},
					]
				],
				initQuoqtqion:{
					name:'',
					old_part:'',
					new_part:'',
					base:'',
					rate:0,
					price:'',
					isOpenNew:false
				},
				updateQuotation:{
					id:'',
					name:'',
					old_part:'',
					new_part:'',
					base:'',
					rate:0,
					price:'',
				},
				check:[false,false,false,false,false,false,false],
			}
		},
		onLoad() {
			this.smartSearch()
		},
		methods: {
			smartSearch() {
				if(!isOpened(sqlName,sqlPath)){
					openDb(sqlName,sqlPath)
				}
				selectQuotationByCondition(this.search).then(res=>{
					this.quotation=res
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
			returnToHome(){
				uni.$u.route({
					url: '/pages/index/index',
					type: 'redirect'
				})
			},
			deleteQuotation(del){
				console.log("删除元素:"+del);
				this.deleteId=del
				this.deleteShow=!this.deleteShow
			},
			confirmDelete(){
				let date=new Date().getTime()
				let opt_time=uni.$u.timeFormat(opt_time,'yyyy-mm-dd')
				if(!isOpened(sqlName,sqlPath)){
					openDb(sqlName,sqlPath)
				}
				deleteQuotation(this.deleteId).then(res=>{
					if(JSON.stringify(res)==='{}'){
						this.$refs.delete_success.show({
							message:'删除成功!',
							type:'success'
						})
						updateQuotationDelOpt(this.deleteId,opt_time).then(res=>{
							if (JSON.stringify(res) === '{}') {
								this.deleteId=''
								this.search=''
								this.deleteShow=!this.deleteShow
								this.smartSearch()
							}
						})
					}
				})
			},
			cancelDelete(){
				this.deleteShow=!this.deleteShow
				this.deleteId=''
			},
			showFilter(){
				this.filterShow=!this.filterShow
			},
			updateClose(){
				this.updateShow=!this.updateShow
			},
			confirmFilter(e){
				if(!isOpened(sqlName,sqlPath)){
					openDb(sqlName,sqlPath)
				}
				switch(e.indexs[0]){
					case 0:
						this.filterText='默认'
						selectQuotationByCondition(this.search).then(res=>{
							this.quotation=res
						})
						break
					case 1:
						this.filterText='件名(升序)'
						selectQuotationOrderByName(this.search,'asc').then(res=>{
							this.quotation=res
						})
						break
					case 2:
						this.filterText='件名(降序)'
						selectQuotationOrderByName(this.search,'desc').then(res=>{
							this.quotation=res
						})
						break
					case 3:
						this.filterText='基本价(升序)'
						selectQuotationOrderByBase(this.search,'asc').then(res=>{
							this.quotation=res
						})
						break
					case 4:
						this.filterText='基本价(降序)'
						selectQuotationOrderByBase(this.search,'desc').then(res=>{
							this.quotation=res
						})
						break
					case 5:
						this.filterText='现价(升序)'
						selectQuotationOrderByPrice(this.search,'asc').then(res=>{
							this.quotation=res
						})
						break
					case 6:
						this.filterText='现价(降序)'
						selectQuotationOrderByPrice(this.search,'desc').then(res=>{
							this.quotation=res
						})
						break
				}
				closeDb(sqlName)
				this.showFilter()
			},
			swipeClick(e,obj){
				if(e.index===0){
					if(obj.new_part===undefined||obj.new_part===''||obj.new_part===null||obj.new_part==='null'){
						this.isOpenNew=false
						this.updateQuotation.new_part=""
						this.initQuoqtqion.new_part=""
						this.initQuoqtqion.isOpenNew=this.isOpenNew
					}else{
						this.isOpenNew=true
						this.initQuoqtqion.isOpenNew=this.isOpenNew
						this.updateQuotation.new_part=obj.new_part
					}
					this.initQuoqtqion.name=obj.c_name
					this.initQuoqtqion.old_part=obj.old_part
					this.initQuoqtqion.new_part=obj.new_part
					this.initQuoqtqion.base=obj.base_price
					this.initQuoqtqion.rate=obj.rate
					this.initQuoqtqion.price=obj.price
					this.updateQuotation.id=obj.cid
					this.updateQuotation.name=obj.c_name
					this.updateQuotation.old_part=obj.old_part
					this.updateQuotation.base=obj.base_price
					this.updateQuotation.rate=obj.rate
					this.updateQuotation.price=obj.price
					this.updateShow=!this.updateShow
				}else if(e.index===1){
					this.deleteQuotation(obj.cid)
				}
			},
			resetQuotation(){
				this.updateQuotation.name=this.initQuoqtqion.name
				this.updateQuotation.old_part=this.initQuoqtqion.old_part
				this.updateQuotation.new_part=this.initQuoqtqion.new_part
				this.updateQuotation.base=this.initQuoqtqion.base
				this.updateQuotation.rate=this.initQuoqtqion.rate
				this.updateQuotation.price=this.initQuoqtqion.price
				this.isOpenNew=this.initQuoqtqion.isOpenNew
			},
			confirmUpdate(){
				let nullUpdateWarn=''
				let smallThenZeroWarn=''
				this.checkName()
				this.checkOld()
				this.checkNew()
				this.checkBase()
				this.checkPrice()
				if(!this.check.every(item=>item===false)){
					if(this.check[0]===true){
						nullUpdateWarn=nullUpdateWarn+'件名,'
					}
					if(this.check[1]===true){
						nullUpdateWarn=nullUpdateWarn+'旧件号,'
					}
					if(this.check[2]===true){
						nullUpdateWarn=nullUpdateWarn+'新件号,'
					}
					if(this.check[3]===true){
						smallThenZeroWarn=smallThenZeroWarn+'基本价,'
					}
					if(this.check[4]===true){
						nullUpdateWarn=nullUpdateWarn+'基本价,'
					}
					if(this.check[5]===true){
						smallThenZeroWarn=smallThenZeroWarn+'现价'
					}
					if(this.check[6]===true){
						nullUpdateWarn=nullUpdateWarn+'现价'
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
			autoInsertOld(){
				this.updateQuotation.old_part=this.updateQuotation.name
			},
			autoCalculate(){
				if(this.updateQuotation.base!==''||this.updateQuotation.base!==0){
					if(this.updateQuotation.rate===0.00){
						this.updateQuotation.price=this.updateQuotation.base
					}else{
						this.updateQuotation.price=Math.round(Number(this.updateQuotation.base)*(1+(Number(this.updateQuotation.rate))))
					}
				}
			},
			checkName(){
				if(this.updateQuotation.name===undefined||this.updateQuotation.name===''){
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
			checkOld(){
				if(this.updateQuotation.old_part===undefined||this.updateQuotation.old_part===''){
					this.$refs.check_warn.show({
						message:'旧件号不能为空!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[1]=true
				}else{
					this.check[1]=false
				}
			},
			checkNew(){
				if((this.updateQuotation.new_part===undefined||this.updateQuotation.new_part==='')&&this.isOpenNew===true){
					this.$refs.check_warn.show({
						message:'新件号不能为空!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[2]=true
				}else{
					this.check[2]=false
				}
			},
			checkBase(){
				if(Number(this.updateQuotation.base)<0){
					this.$refs.check_warn.show({
						message:'基本价不能小于0!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[3]=true
				}else if(this.updateQuotation.base===undefined||this.updateQuotation.base===''){
					this.$refs.check_warn.show({
						message:'基本价不能为空!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[4]=true
				}else{
					this.check[3]=false
					this.check[4]=false
				}
			},
			checkPrice(){
				if(Number(this.updateQuotation.price)<0){
					this.$refs.check_warn.show({
						message:'现价不能小于0!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[5]=true
				}else if(this.updateQuotation.price===undefined||this.updateQuotation.price===''){
					this.$refs.check_warn.show({
						message:'现价不能为空!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[6]=true
				}else{
					this.check[5]=false
					this.check[6]=false
				}
			},
			update(){
				let date=new Date().getTime()
				let opt_time=uni.$u.timeFormat(opt_time,'yyyy-mm-dd')
				if(!isOpened(sqlName,sqlPath)){
					openDb(sqlName,sqlPath)
				}
				if(this.updateQuotation.new_part===undefined||this.updateQuotation.new_part===''||this.updateQuotation.new_part==='null'){
					updateQuotation(this.updateQuotation.id,this.updateQuotation.name,this.updateQuotation.old_part,this.updateQuotation.base,this.updateQuotation.rate,this.updateQuotation.price,opt_time).then(res=>{
						if(JSON.stringify(res)==='{}'){
							this.$refs.update_success.show({
								message:'库存更新成功!',
								type:'success'
							})
						}
					})
				}else{
					updateQuotationHaveNew(this.updateQuotation.id,this.updateQuotation.name,this.updateQuotation.old_part,this.updateQuotation.new_part,this.updateQuotation.base,this.updateQuotation.rate,this.updateQuotation.price,opt_time).then(res=>{
						if(JSON.stringify(res)==='{}'){
							this.$refs.update_success.show({
								message:'库存更新成功!',
								type:'success'
							})
						}
					})
				}
				this.resetQuotation()
				this.ifUpdate=!this.ifUpdate
				this.smartSearch()
			},
			closeUpdate(){
				this.ifUpdate=!this.ifUpdate
				this.updateShow=!this.updateShow
			}
		}
	}
</script>

<style lang="scss">
	.content{
		margin-top: 20rpx;
	}
	.search_result{
		margin-top: 10rpx;
	}
	.data_card{
		height: 80rpx;
		line-height: 80rpx;
		border-bottom: 1rpx solid #909399;
	}
	.filter{
		margin-top: 20rpx;
	}
	.update{
		width: 600rpx;
		height: 820rpx;
	}
	.update_form{
		margin-top: 80rpx;
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
	.switch_item{
		display: flex;
		justify-content: center;
		position: relative;
		margin-top: 20rpx;
	}
	.number_box_item{
		display: flex;
		justify-content: center;
		position: relative;
		margin-top: 20rpx;
	}
</style>