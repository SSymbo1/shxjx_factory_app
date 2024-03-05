import {
	sqlName,
	selectSql,
	executeSql
} from './sqlite_helper.js'
const name = sqlName

export async function selectLastUpdateInventory(){
	let sql=`SELECT * FROM inventory ORDER BY opt_time DESC LIMIT 1`
	let result=await selectSql(sqlName,sql)
	return result
}

export async function selectLastUpdateQuotation(){
	let sql=`SELECT * FROM quotation ORDER BY opt_time DESC LIMIT 1`
	let result=await selectSql(sqlName,sql)
	return result
}

export async function selectInventoryWarn(){
	let sql=`SELECT * FROM inventory WHERE del!=1 ORDER BY final LIMIT 1`
	let result=await selectSql(sqlName,sql)
	return result
}

export async function selectQuotationByCondition(condition){
	let sql=`SELECT * FROM quotation WHERE del!=1 AND (c_name LIKE '%${condition}%' OR old_part LIKE '%${condition}%' OR new_part LIKE '%${condition}%')`
	let result=await selectSql(sqlName,sql)
	return result
}

export async function selectInventoryByCondition(condition){
	let sql =`SELECT * FROM inventory WHERE del!=1 AND name LIKE '%${condition}%'`
	let result=await selectSql(sqlName,sql)
	return result
}

export async function selectInventoryOrderByName(condition,by){
	let sql=`SELECT * FROM inventory WHERE del!=1 AND name LIKE '%${condition}%'`
	if(by==='desc'){
		sql=sql+` ORDER BY name DESC`
	}else{
		sql=sql+` ORDER BY name ASC`
	}
	let result=await selectSql(sqlName,sql)
	return result
}

export async function selectInventoryOrderByOrigin(condition,by){
	let sql=`SELECT * FROM inventory WHERE del!=1 AND name LIKE '%${condition}%'`
	if(by==='desc'){
		sql=sql+` ORDER BY origin DESC`
	}else{
		sql=sql+` ORDER BY origin ASC`
	}
	let result=await selectSql(sqlName,sql)
	return result
}

export async function selectInventoryOrderByFinal(condition,by){
	let sql=`SELECT * FROM inventory WHERE del!=1 AND name LIKE '%${condition}%'`
	if(by==='desc'){
		sql=sql+` ORDER BY final DESC`
	}else{
		sql=sql+` ORDER BY final ASC`
	}
	let result=await selectSql(sqlName,sql)
	return result
}

export async function selectQuotationOrderByName(condition,by){
	let sql=`SELECT * FROM quotation WHERE del!=1 AND (c_name LIKE '%${condition}%' OR old_part LIKE '%${condition}%' OR new_part LIKE '%${condition}%')`
	if(by==='desc'){
		sql=sql+` ORDER BY c_name DESC`
	}else{
		sql=sql+` ORDER BY c_name ASC`
	}
	let result=await selectSql(sqlName,sql)
	return result
}

export async function selectQuotationOrderByBase(condition,by){
	let sql=`SELECT * FROM quotation WHERE del!=1 AND (c_name LIKE '%${condition}%' OR old_part LIKE '%${condition}%' OR new_part LIKE '%${condition}%')`
	if(by==='desc'){
		sql=sql+` ORDER BY base_price DESC`
	}else{
		sql=sql+` ORDER BY base_price ASC`
	}
	let result=await selectSql(sqlName,sql)
	return result
}

export async function selectQuotationOrderByPrice(condition,by){
	let sql=`SELECT * FROM quotation WHERE del!=1 AND (c_name LIKE '%${condition}%' OR old_part LIKE '%${condition}%' OR new_part LIKE '%${condition}%')`
	if(by==='desc'){
		sql=sql+` ORDER BY price DESC`
	}else{
		sql=sql+` ORDER BY price ASC`
	}
	let result=await selectSql(sqlName,sql)
	return result
}

export async function selectQuotationForCreateXls(){
	let sql=`SELECT c_name '件名',price '单价' FROM quotation WHERE del!=1`
	let result=await selectSql(sqlName,sql)
	return result
}

export async function insertIntoInventory(name,origin,final,opt_time){
	let sql=`INSERT INTO inventory(name,origin,final,opt_time) VALUES('${name}',${origin},${final},'${opt_time}')`
	let result=await executeSql(sqlName,sql)
	return result
}

export async function insertIntoQuotation(quotation,opt_time){
	let sql=`INSERT INTO quotation(c_name,old_part,base_price,rate,price,opt_time) VALUES('${quotation.c_name}','${quotation.old_part}',${quotation.base_price},${quotation.rate},${quotation.price},'${opt_time}')`
	let result= executeSql(sqlName,sql)
	return result
}

export async function insertIntoQuotationHaveNew(quotation,opt_time){
	let sql=`INSERT INTO quotation(c_name,old_part,new_part,base_price,rate,price,opt_time) VALUES('${quotation.c_name}','${quotation.old_part}','${quotation.new_part}',${quotation.base_price},${quotation.rate},${quotation.price},'${opt_time}')`
	let result= executeSql(sqlName,sql)
	return result
}

export async function deleteInventory(id){
	let sql=`UPDATE inventory SET del=1 WHERE iid=${id}`
	let result=executeSql(sqlName,sql)
	return result
}

export async function deleteQuotation(id){
	let sql=`UPDATE quotation SET del=1 WHERE cid=${id}`
	let result=executeSql(sqlName,sql)
	return result
}

export async function updateInventoryDelOpt(id,opt){
	let sql=`UPDATE inventory SET opt_time='${opt}' WHERE iid=${id}`
	let result=executeSql(sqlName,sql)
	return result
}

export async function updateQuotationDelOpt(id,opt){
	let sql=`UPDATE quotation SET opt_time='${opt}' WHERE cid=${id}`
	let result=executeSql(sqlName,sql)
	return result
}

export async function updateInventory(id,name,origin,in_num,out_num,final,opt){
	let sql=`UPDATE inventory SET name='${name}',origin=${origin},in_num=${in_num},out_num=${out_num},final=${final},opt_time='${opt}' WHERE iid=${id}`
	let result=executeSql(sqlName,sql)
	return result
}

export async function updateQuotation(id,name,old_part,base,rate,price,opt){
	let sql=`UPDATE quotation SET c_name='${name}',old_part='${old_part}',base_price=${base},rate=${rate},price=${price},opt_time='${opt}' WHERE cid=${id}`
	let result=executeSql(sqlName,sql)
	return result
}

export async function updateQuotationHaveNew(id,name,old_part,new_part,base,rate,price,opt){
	let sql=`UPDATE quotation SET c_name='${name}',old_part='${old_part}',new_part='${new_part}',base_price=${base},rate=${rate},price=${price},opt_time='${opt}' WHERE cid=${id}`
	let result=executeSql(sqlName,sql)
	return result
}