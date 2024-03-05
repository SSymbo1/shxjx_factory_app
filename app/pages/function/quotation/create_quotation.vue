<template>
	<view>
		<u-navbar 
			title="新建报价" 
			height="80rpx" 
			leftText="返回" 
			:placeholder="true" 
			fixed 
			@leftClick="returnToHome">
		</u-navbar>
		<u-divider text="报价信息" textPosition="left"></u-divider>
		<view class="quotation_form">
			<view class="input_item">
				<u--input 
					placeholder="请输入件名,不能为空" 
					shape="circle" 
					v-model="quotation.c_name" 
					prefixIcon="file-text"
					prefixIconStyle="font-size: 22px;color: #909399" 
					clearable 
					@blur="checkInputName"
					@change="autoInsertPart"
					style="width: 600rpx; display: inline-block;">
				</u--input>
			</view>
			<view class="input_item">
				<u--input 
					placeholder="请输入旧件号,不能为空" 
					shape="circle" 
					v-model="quotation.old_part" 
					prefixIcon="file-text"
					prefixIconStyle="font-size: 22px;color: #909399" 
					clearable 
					@blur="checkInputOldPart"
					style="width: 600rpx; display: inline-block;">
				</u--input>
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
				<u--input 
					placeholder="请输入新件号,新件号开启时不能为空" 
					shape="circle" 
					v-model="quotation.new_part" 
					prefixIcon="file-text"
					prefixIconStyle="font-size: 22px;color: #909399" 
					clearable 
					@blur="checkInputNewPart"
					:disabled="!isOpenNew"
					style="width: 600rpx; display: inline-block;">
				</u--input>
			</view>
			<u-divider text="报价" textPosition="left" style="margin-top: 50rpx;"></u-divider>
			<view class="input_item">
				<u--input 
					placeholder="请输入基本价格,不能为空" 
					shape="circle" 
					v-model="quotation.base_price" 
					prefixIcon="order"
					type="number"
					prefixIconStyle="font-size: 22px;color: #909399" 
					clearable 
					@blur="checkInputBasePrice"
					style="width: 600rpx; display: inline-block;">
				</u--input>
			</view>
			<view class="number_box_item">
				<text style="margin-right: 15rpx;">折率</text>
				<u-number-box 
					v-model="quotation.rate" 
					:step="0.10" 
					:max="1" 
					:min='-0.99' 
					decimal-length="2" 
					:blur="autoCalculate()">
				</u-number-box>
			</view>
			<view class="input_item">
				<u--input 
					placeholder="请输入现价,不能为空" 
					shape="circle" 
					type="number"
					v-model="quotation.price" 
					prefixIcon="order"
					prefixIconStyle="font-size: 22px;color: #909399" 
					clearable 
					@blur="checkInputPrice"
					style="width: 600rpx; display: inline-block;">
				</u--input>
			</view>
			<view class="button_item">
				<u-button 
					class="create_btn" 
					type="primary" 
					text="创建" 
					shape="circle" 
					icon="checkmark"
					@click="createQuotation" 
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
			<u-notify ref="check_warn"></u-notify>
			<u-toast ref="create_success"></u-toast>
		</view>
	</view>
</template>

<script>
	import {sqlName,sqlPath,openDb,closeDb,isOpened} from '@/static/js/sqlite_helper.js'
	import {insertIntoQuotation,insertIntoQuotationHaveNew} from '@/static/js/crud.js'
	export default {
		data() {
			return {
				quotation: {
					c_name: '',
					old_part: '',
					new_part: '',
					base_price: '',
					rate:0,
					price: ''
				},
				isOpenNew:false,
				check:[false,false,false,false,false,false,false],
			}
		},
		onLoad() {

		},
		methods: {
			returnToHome() {
				uni.$u.route({
					url: '/pages/index/index',
					type: 'redirect'
				})
			},
			createQuotation(){
				let nullCreateWarn=''
				let smallThenZeroWarn=''
				this.checkInputName()
				this.checkInputOldPart()
				this.checkInputNewPart()
				this.checkInputBasePrice()
				this.checkInputPrice()
				if(!this.check.every(item=>item===false)){
					if(this.check[0]===true){
						nullCreateWarn=nullCreateWarn+'件名,'
					}
					if(this.check[1]===true){
						nullCreateWarn=nullCreateWarn+'旧件号,'
					}
					if(this.check[2]===true){
						nullCreateWarn=nullCreateWarn+'新件号,'
					}
					if(this.check[3]===true){
						smallThenZeroWarn=smallThenZeroWarn+'基本价,'
					}
					if(this.check[4]===true){
						nullCreateWarn=nullCreateWarn+'基本价,'
					}
					if(this.check[5]===true){
						smallThenZeroWarn=smallThenZeroWarn+'现价'
					}
					if(this.check[6]===true){
						nullCreateWarn=nullCreateWarn+'现价'
					}
					if(nullCreateWarn!==''){
						nullCreateWarn=nullCreateWarn+'不能为空!'
						this.$refs.check_warn.show({
							message:nullCreateWarn,
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
					let date=new Date().getTime()
					let opt_time=uni.$u.timeFormat(opt_time,'yyyy-mm-dd')
					if(!isOpened(sqlName,sqlPath)){
						openDb(sqlName,sqlPath)
					}
					if(this.isOpenNew===false){
						insertIntoQuotation(this.quotation,opt_time).then(res=>{
							if(JSON.stringify(res)==='{}'){
								this.resetQuotation()
								this.$refs.create_success.show({
									message:'报价创建成功!',
									type:'success'
								})
							}
						})
					}else{
						insertIntoQuotationHaveNew(this.quotation,opt_time).then(res=>{
							if(JSON.stringify(res)==='{}'){
								this.resetQuotation()
								this.$refs.create_success.show({
									message:'报价创建成功!',
									type:'success'
								})
							}
						})
					}
					closeDb(sqlName)
				}
			},
			resetQuotation(){
				this.quotation.c_name=""
				this.quotation.old_part=""
				this.isOpenNew=false
				this.quotation.new_part=""
				this.quotation.base_price=""
				this.quotation.rate=0.00
				this.quotation.price=""
			},
			checkInputName(){
				if(this.quotation.c_name===''){
					this.$refs.check_warn.show({
						message:'请输入件名!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[0]=true
				}else{
					this.check[0]=false
				}
			},
			checkInputOldPart(){
				if(this.quotation.old_part===''){
					this.$refs.check_warn.show({
						message:'请输入旧件号!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[1]=true
				}else{
					this.check[1]=false
				}
			},
			checkInputNewPart(){
				if(this.quotation.new_part===""&&this.isOpenNew===true){
					this.$refs.check_warn.show({
						message:'请输入新件号!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[2]=true
				}else{
					this.check[2]=false
				}
			},
			checkInputBasePrice(){
				if(this.quotation.base_price===""){
					this.$refs.check_warn.show({
						message:'请输入基本价!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[3]=true
				}else if(Number(this.quotation.base_price)<0){
					this.$refs.check_warn.show({
						message:'基本价不能小于零!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[4]=true
				}else{
					this.check[3]=false
					this.check[4]=false
				}
			},
			checkInputPrice(){
				if(this.quotation.price===""){
					this.$refs.check_warn.show({
						message:'请输入现价!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[5]=true
				}else if(Number(this.quotation.price)<0){
					this.$refs.check_warn.show({
						message:'现价不能小于零!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[6]=true
				}else{
					this.check[5]=false
					this.check[6]=false
				}
			},
			autoInsertPart(){
				this.quotation.old_part=this.quotation.c_name
			},
			autoCalculate(){
				if(this.quotation.base_price!==''||this.quotation.base_price!==0){
					if(this.quotation.rate===0.00){
						this.quotation.price=this.quotation.base_price
					}else{
						this.quotation.price=Math.round(Number(this.quotation.base_price)*(1+(Number(this.quotation.rate)))) 
					}
				}
			}
		}
	}
</script>

<style lang="scss">
	.input_item {
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
	.quotation_form {
		margin-top: 20rpx;
	}
	.button_item {
		width: 400rpx;
		margin-top: 30rpx;
		display: flex;
		justify-content: center;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}
</style>