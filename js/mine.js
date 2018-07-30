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

var start = 0;
var end = 10;
var amount = 0;

var personal = new Vue({
	el:"#personal",
	data:{
		nickName:"匿名人士",
		info:"他很懒，什么都没写",
		parse:0,
		integral:0,
		balance:0,
		avatar:avatar
	},
	methods:{
        editInfo(){
        	if(userName != ""){
        		// 刷新当前页面
				window.location.href="editInfo.html";
        	}else{
        		login.$data.showMask = true;
        	}
        }
	},
	created(){
		if(avatar == ""){
			this.avatar = "images/default.png"
		}
		var that = this;
		$.ajax({
			url: url+'&do=api_account&op=userinfo&state=we7sid-'+id,
			type: 'POST',
			dataType: 'json',
			data: {
				type: 'info'
			},
		})
		.done(function(data) {
			////console.log(data);
			if(data.bio !== ""){
				that.info = data.bio;
			}
			// 判断用户名是否为空
			if(data.nickname == "" && data.email == "" && data.mobile != ""){
				that.nickName = data.mobile;
			}else if(data.nickname == "" && data.mobile == "" && data.email != ""){
				that.nickName = data.email;
			}else if(data.nickname != ""){
				that.nickName = data.nickname;
			}
			// 获得的赞
			that.parse = data.credit3;
			// 积分
			that.integral = data.credit1;
			// 余额
			that.balance = data.credit2;
			
		})
		.fail(function(err) {

			////console.log(err);
		})
		.always(function() {
			////console.log("complete");
		});
		
	}
});
var writeNewArticle = new Vue({
	el:"#writeNewArticle",
	data:{
		"remember":""
	},
	methods:{
        jumpTo(){
        	////console.log(userName);
        	if(userName != ""){
        		// 刷新当前页面
				window.location.href="articleDetail.html";
        	}else{
        		login.$data.showMask = true;
        	}
        }
    }
});
// 模板列表
var moduleList = new Vue({
	el:"#contentList",
	data:{
		"infoList": [],
		toUrl:"postings.html",
		postId: "",
		editUrl:"articleDetail.html",
		OnExamine:"待审核...",
		ExamineErr:"审核未通过!",
		hasBase:false,
		hasNoArticle:false
	},
	methods:{
        deleteArticle(id){
        	var that = this;
        	////console.log(id);
        	layer.open({
			  type: 0, 
			  title:"提示",
			  content: "确定删除文章及评论吗", //这里content是一个普通的String
			  yes: function(index, layero){
			  		$.ajax({
			  			url: url+'&do=api_posts&op=delete_posts&state=we7sid-' +id,
			  			type: 'POST',
			  			dataType: 'json',
			  			data: {
			  				posts_id:id
			  			},
			  		})
			  		.done(function(data) {
			  			////console.log(data);
			  			if(data.code == 0){
			  				articleContent();
			  			}else{
			  				alert(data.msg)
			  			}
			  		})
			  		.fail(function() {
			  			////console.log("error");
			  		})
			  		.always(function() {
			  			////console.log("complete");
			  		});
			  		layer.close(index); //如果设定了yes回调，需进行手工关闭
			  }
			});
        }
    },
    created(){

    }
})
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
function articleContent(){
	// 请求数据
	$.ajax({
		url: url+'&do=api_posts&op=get_my_posts&state=we7sid-'+id,
		type: 'GET',
		dataType: 'json',
		data: {
			limit1:start,
			limit2:end
		},
	})
	.done(function(data) {
		////console.log(data);
		if(data.count.count == "0"){
			moduleList.$data.hasNoArticle = true;
		}else{
			var info = data.data;
			amount = data.count.count;
			// 操作Vue实例里的变量
			for(var i=0;i<info.length;i++){
				var time = timestampToTime(info[i].create_time);
				if(info[i].isshow == 0){
					// 审核中
					info[i].OnExamine = true;
					info[i].ExamineErr = false;
				}else if(info[i].isshow == 1){
					// 审核通过
					info[i].OnExamine = false;
					info[i].ExamineErr = false;
				}else if(info[i].isshow == 2){
					// 审核未通过
					info[i].OnExamine = false;
					info[i].ExamineErr = true;
				}
				////console.log(time)
				info[i].create_time = time;
				// ////console.log(timestampToTime(info[i].posts[j].create_time));
			}
			// ////console.log(info[2].posts[0].time)
			moduleList.$data.infoList = info;
		}
		
	})
	.fail(function(err) {
		////console.log(err);
	}).always(function() {
		////console.log("complete");
	});
}
// 首次加载文章列表
articleContent();
// 鼠标滚轮事件
var d = document.getElementById("contentList").offsetHeight;
// console.info(d);
window.addEventListener("scroll", function(event) {
    var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
    // ////console.log(scrollTop);  
    if(document.documentElement.scrollHeight == document.documentElement.clientHeight + scrollTop) {
        // alert("Touch_Buttom!");
        end += 10;
        if(end < amount + 10){
        	// 隐藏底线
        	// moduleList.$data.hasBase = false;
       	 	articleContent();
        }else if(end >= amount){
        	// 显示底线
        	// moduleList.$data.hasBase = true;
        }
        
    }
});