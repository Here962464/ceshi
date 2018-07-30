function getCookie(c_name){
	if (document.cookie.length>0){
		c_start=document.cookie.indexOf(c_name + "=")
		if (c_start!=-1){ 
		    c_start=c_start + c_name.length+1 
		    c_end=document.cookie.indexOf(";",c_start)
		    if (c_end==-1) c_end=document.cookie.length
		    return unescape(document.cookie.substring(c_start,c_end))
		} 
	}
	return ""
}
// 获取session数据
// 用户名
var userName = getCookie('userName');
//头像
var avatar = getCookie('avatar');
// sessionId
var id = getCookie('sessionId');
// 服务器地址
var url = getCookie('url');
// 起始条数
var start = 0;
// 每页条数
var end = 10;
// 总数
var amount = 0;
// 模板
var moduleInfo = new Vue({
	el:"#content",
	data:{
		"infoList": [
			 {
				"class_name":"class1",
				"configure": {
					"url": "http://test.com",
					"icon": "#12KLSA"
				},
				"posts": [{
					"id": 123,
					"title": "标题1",
					"content": "内容1",
				}, {
					"id": 123,
					"title": "标题1",
					"content": "内容1"
				}]
			}
		],
		toUrl:"postings.html"
	},
	methods:{
        
    },
    created(){
    	// 请求数据
    	var that = this;
		$.ajax({
			url: "http://192.168.1.105/app/index.php?i=2&c=entry&do=api_posts&m=gengkuai_BBS",
			type: 'GET',
			dataType: 'json',
			data: {
				'op':'display'
			},
		})
		.done(function(data) {
			////console.log(data)
			var info = data.data;
			if(data.code == 0){
				// 操作Vue实例里的变量
				for(var i=0;i<info.length;i++){
					for(var j=0;j<info[i].posts.length;j++){
						var time = timestampToTime(info[i].posts[j].create_time)
						// info[i].posts[j][time] = time;
						// ////console.log(time)
						info[i].posts[j].create_time = time;
					}
				}
				// ////console.log(info[2].posts[0].time)
				that.infoList = info;
			}
		})
		.fail(function(err) {
			////console.log(err);
			// alert("服务器出错啦，请刷新页面！")
		}).always(function() {
			////console.log("complete");
		});
    }
})
// 模板列表
var moduleList = new Vue({
	el:"#contentList",
	data:{
		"toUrl":"postings.html",
		"classify":[],
		"infoList": [],
		"classId":1,
		"index":0,
		"remember":"#",
		"targetWay":"",
		"name":"",
		"hasBase":false
	},
	methods:{
        hasLogIn(){
        	////console.log(userName);
        	if(userName != ""){
        		// 刷新当前页面
				window.location.href='articleDetail.html';
        	}else{
        		login.$data.showMask = true;
        	}
        }
    }
})
// 默认加载分类
function load(){
	// 请求分类
	$.ajax({
		url: "http://192.168.1.105/app/index.php?i=2&c=entry&do=api_posts&m=gengkuai_BBS&op=class",
		type: 'GET',
		dataType: 'json',
		data: {}
	})
	.done(function(data) {
		////console.log(data);
		if(data.code == 0){
    		var tempInfo = data.data;
			// 加载一级分类
			var tempArray = [];
			for(var i=0;i<tempInfo.length;i++){
				if(tempInfo[i].parent_id == 0){
					tempArray.push(tempInfo[i]);
					moduleList.$data.classify = tempArray;
				}
			}
			////console.log(moduleList.$data.classify);
			// 加载一级分类下的文章列表
			var tempId = tempArray[0].id;
			getArticle(tempId);
			// ////console.log(tempId);
			moduleList.$data.classId = tempId;
			////console.log(moduleList.$data.classId);
		}
	})
	.fail(function(err) {
		////console.log(err);
		// alert("服务器出错啦，请刷新页面！")
	})
	.always(function() {
		////console.log("complete");
	});
}
function getArticle(id){
	////console.log(id);
	// 请求数据
	$.ajax({
		url: "http://192.168.1.105/app/index.php?i=2&c=entry&do=api_posts&m=gengkuai_BBS&op=display2",
		type: 'GET',
		dataType: 'json',
		data: {
			'class_id':id,
			"limit1":start,
			"limit2":end
		},
	})
	.done(function(data) {
		////console.log(data);
		var info = data.data;
		if(data.code == 0){
			amount = data.count;
			////console.log(amount)
		}
		for(var i=0;i<info.length;i++){
			// ////console.log(info[i].create_time);
			// 判断日期
			if(info[i].create_time == 0){
				info[i].create_time = "一个月黑风高的日子";
			}else{
				var time = timestampToTime(info[i].create_time);
				info[i].create_time = time;
			}
			// 判断用户名
			if(info[i].user_name == ""){
				info[i].user_name = "佚名";
			}
		}
		moduleList.$data.infoList = info;
		////console.log(moduleList.$data.infoList);
	})
	.fail(function(err) {
		////console.log(err);
		// alert("服务器出错啦，请刷新页面！")
	}).always(function() {
		////console.log("complete");
	});
}
load();

// 日期格式转换
function timestampToTime(timestamp) {
    var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = date.getFullYear() + '-';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    D = date.getDate() + ' ';
    h = date.getHours() + ':';
    m = date.getMinutes() + ':';
    s = date.getSeconds();
    return Y+M+D;
}
//tab切换
setTimeout(function(){
	$(".contentBlock").first().addClass("contentBlock-active");
	$(".class_name").first().addClass("class_name_active");
	$(".content").on("click","li",function(e){
		////console.log(this)
        $(this).addClass("class_name_active").siblings().removeClass("class_name_active");
        var index = $(this).index();
        ////console.log(index)
        $(".contentBlock").eq(index).addClass("contentBlock-active").siblings().removeClass("contentBlock-active");
    });
},500)
var articleIndex = 0;
//tab切换
setTimeout(function(){
	$(".lists").first().addClass("lists_active");
	$(".listClassify_son").first().addClass("selected");
	$(".listClassify_son").on("click",function(e){
		// ////console.log(this)
        $(this).addClass("selected").siblings().removeClass("selected");
        var index = $(this).index();
        articleIndex = index;
        moduleList.$data.classId = moduleList.$data.classify[index].id;
        getArticle(moduleList.$data.classify[index].id);
    });
    
},500)
// 鼠标滚轮事件
var d = document.getElementById("contentList").offsetHeight;
// console.info(d);
window.addEventListener("scroll", function(event) {
    var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
    // ////console.log(scrollTop);  
    if(document.documentElement.scrollHeight == document.documentElement.clientHeight + scrollTop) {
        // alert("Touch_Buttom!");
        end += 10;
        ////console.log(end)
        ////console.log(amount)
        var dog = amount+10;
        if(end < dog){
        	// 隐藏底线
        	moduleList.$data.hasBase = false;
       	 	getArticle(moduleList.$data.classify[articleIndex].id);
        }else{
        	// 显示底线
        	moduleList.$data.hasBase = true;
        }
        
    }
});