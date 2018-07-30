
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
// uId
var uId = getCookie('uId');
////console.log(uId)
////console.log(userName)

var head_title = new Vue({
	el:"#title",
	data:{
		id:0,
		title:"七蚁科技"
	}
})
var app = new Vue({
	el:"#app",
	data:{
		id:0,
		title:"七蚁科技",
		user_name:"七蚁科技",
		view_count:0,
		create_time:"一个月黑风高的日子",
		articleContent:"",
		comment_count:0,
		showComment:false,
		avatar:avatar,
		// 评论变量
		info:[

		],
		myName:userName
	},
	methods:{
		showCommentBox(){
			if(userName != ""){
				this.showComment = !this.showComment;
			}else{
				login.$data.showMask = true;
			}
		},
		agree(){

		},
		repaly(){

		}
	},
	watch:{   //watch()监听某个值（双向绑定）的变化，从而达到change事件监听的效果
        items:{
            handler:function(){
                var _this = this;
                var _sum = 30; //字体限制为100个
                _this.$refs.count.setAttribute("maxlength",_sum);
                _this.number= _sum- _this.$refs.count.value.length;
            },
            deep:true
        }
    },
	// vue生命周期
	created(){
		this.id = $.query.get('id')
		////console.log(this.id)
		var that = this;
		//评论头像
		if(userName == ""){
			this.avatar = "images/default.png"
		}
		// 发请求
		$.ajax({
			url: "http://192.168.1.105/app/index.php?i=2&c=entry&do=api_posts&m=gengkuai_BBS&op=get_one_post",
			type: 'POST',
			dataType: 'json',
			data: {
				id: that.id
			},
		})
		.done(function(data) {
			////console.log(data);
			if(data.code == 0){
				var tempInfo = data.data;
				// 文章标题
				that.title = tempInfo.title;
				// 设置网页标题
				head_title.$data.title = tempInfo.title;
				// 用户名
				that.user_name = tempInfo.user_name;
				if(tempInfo.view_count != null){
					// 看过数量
					that.view_count = tempInfo.view_count;
				}
				if(tempInfo.comment_count != null){
					// 评论数量
					that.comment_count = tempInfo.comment_count;
				}
				// 时间
				var tempTime = timestampToTime(tempInfo.create_time);
				////console.log(tempTime)
				that.create_time = tempTime;
				// 文章内容
				that.articleContent = tempInfo.content;
			}
		})
		.fail(function(err) {
			////console.log(err);
		})
		.always(function() {
			////console.log("complete");
		});
		// 首次加载评论
		fisrtLoadComment(that.id);
	}
})
function fisrtLoadComment(dataId){
	////console.log(1)
	// 请求文章评论
	$.ajax({
		url: 'http://192.168.1.105/app/index.php?i=2&c=entry&do=api_posts&m=gengkuai_BBS&op=get_reply',
		type: 'POST',
		dataType: 'json',
		data: {
			posts_id: dataId
		},
	})
	.done(function(data) {
		////console.log(data);
		var tempInfo = data.data;
		////console.log(app.$data.info)
		app.$data.info = tempInfo;
		writeSon();
	})
	.fail(function(err) {
		////console.log(err);
	})
	.always(function() {
		////console.log("complete");
	});
}
// 日期格式转换
function timestampToTime(timestamp) {
    var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = date.getFullYear() + '年';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '月';
    D = date.getDate() + '日 ';
    h = date.getHours() + ':';
    m = date.getMinutes() + ':';
    s = date.getSeconds();
    return Y+M+D;
}
function writeSon(){
	// tree
	var treeArr = [];
	var html = '';
	function tree( arr , pid , level){
		for (var i = 0; i < arr.length; i++) {
			if( arr[i].pid == pid ){
				arr[i].level = level;
				treeArr.push(arr[i]);
				tree( arr,arr[i].id,level+1 );
			}
   		}
    }
    tree(app.$data.info,0,0)
    ////console.log(app.$data.info);
    for (var i = 0; i <= treeArr.length - 1; i++) {
    	if (treeArr[i].user_id == uId && userName != "") {
    		var deleteContent = '<span class="delete deleteComment'+treeArr[i].id+'"> 删除 <i class="iconfont icon-shanchu"></i></span>';
    	}else{
    		deleteContent = "";
    	}
    	if (treeArr[i].pid == 0) {
    		// 一级评论
    		html += '</ul><ul><li data-id='+treeArr[i].id+' pid='+treeArr[i].pid+' class="commentParent"><img src='+treeArr[i].avatar+'><span class="commentName">'+
			treeArr[i].user_name+'：</span><span class="commentTime">'
			+timestampToTime(treeArr[i].create_time)+'</span><br /><div class="commentContent">'+treeArr[i].content+'</div>'+
			'<div class="miniIcon"><span class="parse data'+treeArr[i].id+'">共 <span class="parseAmount">'+treeArr[i].pares+'</span> 个赞 <i class="iconfont icon-zan"></i>'+
			'</span><span class="commentSon dataComment'+treeArr[i].id+'">评论 <i class="iconfont icon-pinglun"></i>'+
			'</span>' + deleteContent + '</div><div data-id='+treeArr[i].id+' class="hiddenBox"><div class="commenttoWho"><img src='+avatar+'> 我 <span> 回复 </span> '+treeArr[i].user_name+'：</div>'+
			'<textarea class="replay" autofocus></textarea><button>回复</button></div></li>';
    	}else{
    		// 一级评论的子评论
    		html += '<li data-id='+treeArr[i].id+' pid='+treeArr[i].pid+'><img src='+treeArr[i].avatar+'><span class="commentName">'+
			treeArr[i].user_name+'：</span><span class="commentTime">'
			+timestampToTime(treeArr[i].create_time)+'</span><br /><div class="commentContent">'+treeArr[i].content+'</div>'+
			'<div class="miniIcon"><span class="parse data'+treeArr[i].id+'">共 <span class="parseAmount">'+treeArr[i].pares+'</span> 个赞 <i class="iconfont icon-zan"></i>'+
			'</span><span class="commentSon dataComment'+treeArr[i].id+'">评论 <i class="iconfont icon-pinglun"></i>'+
			'</span>' + deleteContent + '</div><div data-id='+treeArr[i].id+' class="hiddenBox"><div class="commenttoWho"><img src='+avatar+'> 我 <span> 回复 </span> '+treeArr[i].user_name+'：</div>'+
			'<textarea class="replay" autofocus></textarea><button>回复</button></div></li>';
    	}
    }
    
    html = html.substr(5,html.length);
    html += '</ul>';
    $('.commentByOther').append(html);
    // tree
    
    var tempIndexParse = {};
    var tempIndexComment = {};
    	////console.log(app.$data.info);
    for(var i=0;i<app.$data.info.length;i++){
    	var pad = app.$data.info[i].id;
    	// ////console.log(pad)
    	// 用变量名做变量名
    	tempIndexParse["index"+pad] = true;
    	tempIndexComment["index"+pad] = true;
    	// tempIndexDelete["index"+pad] = true;
    	// 赞
    	$(".data"+pad).on('click',function(){
    		var tempThis = $(this);
    		if(tempIndexParse["index"+pad]){
    			$(this).addClass('selected');
    			$.ajax({
    				url: url + '&do=api_posts&op=reply_pares&reply_id=1&state=we7sid-' +id,
    				type: 'POST',
    				dataType: 'json',
    				data: {
    					reply_id: pad,
    					type:"add"
    				},
    			})
    			.done(function(data) {
    				////console.log(data)
    				if(data.code ==0){
    					tempThis.find('.parseAmount').text(data.data.pares);
    					
    				}
    			})
    			.fail(function(err) {
    				////console.log(err);
    			})
    			.always(function() {
    				////console.log("complete");
    			});
    			
    			tempIndexParse["index"+pad] = false;
    		}else{
    			$(this).removeClass('selected');
    			$.ajax({
    				url: url + '&do=api_posts&op=reply_pares&reply_id=1&state=we7sid-' +id,
    				type: 'POST',
    				dataType: 'json',
    				data: {
    					id: pad,
    					type:"delete"
    				},
    			})
    			.done(function(data) {
    				////console.log(data)
    				if(data.code ==0){
    					tempThis.find('.parseAmount').text(data.data.pares);
    					
    				}
    			})
    			.fail(function(err) {
    				////console.log(err);
    			})
    			.always(function() {
    				////console.log("complete");
    			});
    			tempIndexParse["index"+pad] = true;
    		}
    	})
    	// 评论回复
    	$(".dataComment"+pad).on('click',function(){
    		////console.log(userName)
    		// 判断登录状态
    		if(userName != ""){
	    		// 显示回复评论的box
	    		if(tempIndexParse["index"+pad]){
	    			$(this).parent().parent().find(".hiddenBox").addClass('show');
	    			tempIndexParse["index"+pad] = false;
	    			//提交回复
		    		$(this).parent().parent().find('button').on('click',function(){
		    			var tempContent = $(this).parent().parent().find(".replay").val();
		    			var pid = $(this).parent().data('id');
		    			if(tempContent != ""){
		    				////console.log(tempContent);
		    				replayComment(tempContent,pid);
		    			}else{
		    				layer.open({
							  type: 0, 
							  title:"提示",
							  content: '回复内容不能为空且不能超过255个字符！' //这里content是一个普通的String
							});
		    			}
		    		})
	    		}else{
	    			$(this).parent().parent().find(".hiddenBox").removeClass('show');
	    			tempIndexParse["index"+pad] = true;
	    		}
    		}else{
    			login.$data.showMask = true;
    		}
    		
    	})
    	// 删除评论
    	$(".deleteComment"+pad).on('click',function(){
    		// if(tempIndexDelete["index"+pad]){

    		// }
    		var tempId = $(this).parent().parent().data("id");
    		layer.open({
			  type: 0, 
			  title:"提示",
			  content: "确定删除这条评论", //这里content是一个普通的String
			  yes: function(index, layero){
			  		$.ajax({
			  			url: url+'&do=api_posts&op=delete_reply&state=we7sid-' +id,
			  			type: 'POST',
			  			dataType: 'json',
			  			data: {
			  				reply_id: tempId,
			  				posts_id:app.$data.id
			  			},
			  		})
			  		.done(function(data) {
			  			////console.log(data);
			  			if(data.code == 0){
							//更新评论数
							app.$data.comment_count = data.comment_count;
					  		$(".commentByOther").empty();
					  		fisrtLoadComment(app.$data.id);
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
    		$(this).parent().parent().find(".delete");
    	})
    }
}
// 评论回复请求
function replayComment(content,pid){
	// if(userName == ""{

	// })
	$.ajax({
		url: url + '&do=api_posts&op=reply&state=we7sid-' +id ,
		type: 'POST',
		dataType: 'json',
		data: {
			posts_id: app.$data.id,
			content: content,
			user_name: userName,
			pid: pid
		},
	})
	.done(function(data) {
		////console.log(data);
		//更新评论数
		app.$data.comment_count = data.comment_count;
		layer.open({
		  type: 0, 
		  title:"提示",
		  content: data.msg, //这里content是一个普通的String
		  yes: function(index, layero){
		  		// 清除节点
		  		$(".commentByOther").empty();
		  		fisrtLoadComment(app.$data.id);
		  		layer.close(index); //如果设定了yes回调，需进行手工关闭
		  }
		});
	})
	.fail(function(err) {
		////console.log(err);
	})
	.always(function() {
		////console.log("complete");
	});
}