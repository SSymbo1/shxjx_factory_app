<template>
	<view>
		<u-navbar
			title="新建库存" 
			height="80rpx" 
			leftText="返回" 
			:placeholder="true" 
			fixed 
			@leftClick="returnToHome">
		</u-navbar>
		<view class="inventory_form">
			<view class="input_item">
				<u--input 
					placeholder="请输入件名/件号,不能为空" 
					shape="circle" 
					v-model="inventory.name"
					prefixIcon="file-text"
					prefixIconStyle="font-size: 22px;color: #909399"
					clearable 
					@blur="checkInputName"
					style="width: 600rpx; display: inline-block;">
				</u--input>
			</view>
			<view class="input_item">
				<u--input 
					placeholder="请输入原库存,不能为空" 
					shape="circle"
					type="number"
					v-model="inventory.origin"
					prefixIcon="order"
					prefixIconStyle="font-size: 22px;color: #909399"
					clearable 
					@blur="checkInputOrigin"
					@change="autoInsertFinal"
					style="width: 600rpx; display: inline-block;">
				</u--input>
			</view>
			<view class="input_item">
				<u--input 
					placeholder="请输入现库存,不能为空,默认为原库存" 
					shape="circle" 
					type="number"
					v-model="inventory.final"
					prefixIcon="order"
					prefixIconStyle="font-size: 22px;color: #909399"
					clearable 
					@blur="checkInputFinal"
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
					@click="createInventory"
					style="width: 180rpx;">
				</u-button>
				<u-button 
					class="reset_btn" 
					type="error" 
					text="重置" 
					shape="circle" 
					icon="trash" 
					style="width: 180rpx;" 
					@click="resetInventory">
				</u-button>
			</view>
		</view>
		<u-notify ref="check_warn"></u-notify>
		<u-toast ref="create_success"></u-toast>
	</view>
</template>

<script>
import { insertIntoInventory } from '@/static/js/crud.js'
import { closeDb, isOpened, openDb, sqlName, sqlPath } from '@/static/js/sqlite_helper.js'
	export default {
		data() {
			return {
				inventory:{
					name:'',
					origin:'',
					final:''
				},
				check:[false,false,false,false,false],
			}
		},
		onLoad() {
			
		},
		methods:{
			returnToHome(){
				uni.$u.route({
					url: '/pages/index/index',
					type: 'redirect'
				})
			},
			createInventory(){
				let nullCreateWarn=''
				let smallThenZeroWarn=''
				this.checkInputName()
				this.checkInputOrigin()
				this.checkInputFinal()
				if(!this.check.every(item=>item===false)){
					if(this.check[0]===true){
						nullCreateWarn=nullCreateWarn+'件名,'
					}
					if(this.check[1]===true){
						nullCreateWarn=nullCreateWarn+'原库存,'
					}
					if(this.check[2]===true){
						smallThenZeroWarn=smallThenZeroWarn+'原库存,'
					}
					if(this.check[3]===true){
						nullCreateWarn=nullCreateWarn+'现库存'
					}
					if(this.check[4]===true){
						smallThenZeroWarn=smallThenZeroWarn+'原库存'
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
					insertIntoInventory(this.inventory.name,this.inventory.origin,this.inventory.final,opt_time).then(res=>{
						if(JSON.stringify(res)==='{}'){
							this.resetInventory()
							this.$refs.create_success.show({
								message:'库存创建成功!',
								type:'success'
							})
						}
					})
					closeDb(sqlName)
				}
			},
			resetInventory(){
				this.inventory.name=''
				this.inventory.origin=''
				this.inventory.final=''
			},
			checkInputName(){
				if(this.inventory.name===''){
					this.$refs.check_warn.show({
						message:'请输入件号或件名!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[0]=true
				}else{
					this.check[0]=false
				}
			},
			checkInputOrigin(){
				if(this.inventory.origin===''){
					this.$refs.check_warn.show({
						message:'请输入原库存量!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[1]=true
				}else if(Number(this.inventory.origin)<0){
					this.$refs.check_warn.show({
						message:'原库存量不能小于零!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[2]=true
				}else{
					this.check[1]=false
					this.check[2]=false
				}
			},
			checkInputFinal(){
				if(this.inventory.final===''){
					this.$refs.check_warn.show({
						message:'请输入现库存量!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[3]=true
				}else if(Number(this.inventory.final)<0){
					this.$refs.check_warn.show({
						message:'现库存量不能小于零!',
						type:'warning',
						safeAreaInsetTop:true
					})
					this.check[4]=true
				}else{
					this.check[3]=false
					this.check[4]=false
				}
			},
			autoInsertFinal(){
				this.inventory.final=this.inventory.origin
			}
		}
	}
</script>

<style lang="scss">
	.input_item{
		margin-top: 20rpx;
		text-align: center;
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
	.inventory_form{
		margin-top: 80rpx;
	}
</style>
