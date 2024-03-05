import {sqlName,executeSql} from "./sqlite_helper.js"

let createInventory = {
	name:"inventory",
	sql:"'iid' INTEGER PRIMARY KEY AUTOINCREMENT,"+
		"'name' TEXT NOT NULL,"+
		"'origin' INTEGER DEFAULT 0,"+
		"'in_num' INTEGER DEFAULT 0,"+
		"'out_num' INTEGER DEFAULT 0,"+
		"'final' INTEGER DEFAULT 0,"+
		"'opt_time' TEXT DEFAULT '1970-1-1',"+
		"'del' INTEGER DEFAULT 0"
}
let createQuotation = {
	name:"quotation",
	sql:"'cid' INTEGER PRIMARY KEY AUTOINCREMENT,"+
		"'c_name' TEXT NOT NULL,"+
		"'old_part' TEXT DEFAULT NULL,"+
		"'new_part' TEXT DEFAULT NULL,"+
		"'base_price' INTEGER NOT NULL,"+
		"'rate' REAL NOT NULL,"+
		"'price' INTEGER DEFAULT 0,"+
		"'opt_time' TEXT DEFAULT '1970-1-1',"+
		"'del' INTEGER DEFAULT 0"
}

export async function initInventory () {
	let result=await executeSql(sqlName,`CREATE TABLE IF NOT EXISTS ${createInventory.name} (${createInventory.sql})`)
	return result
}

export async function initQuotation () {
	let result= await executeSql(sqlName,`CREATE TABLE IF NOT EXISTS ${createQuotation.name} (${createQuotation.sql})`)
	return result
}
