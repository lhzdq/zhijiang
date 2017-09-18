// 文件上传
function unAutoUpload(uploader) {
	var $ = jQuery,
    $list = $('#thelist'),
    $btn = $('#ctlBtn'),
    state = 'pending';
	// 当有文件添加进来的时候
	uploader.on( 'fileQueued', function( file ) {
	    $list.append( '<div id="' + file.id + '" class="item">' +
	        '<h4 class="info">' + file.name + '</h4>' +
	        '<p class="state">等待上传...</p>' +
	    '</div>' );
	});
	
	// 文件上传过程中创建进度条实时显示。
	uploader.on( 'uploadProgress', function( file, percentage ) {
	    var $li = $( '#'+file.id ),
	        $percent = $li.find('.progress .progress-bar');
	    // 避免重复创建
	    if ( !$percent.length ) {
	        $percent = $('<div class="progress progress-striped active">' +
	          '<div class="progress-bar" role="progressbar" style="width: 0%">' +
	          '</div>' +
	        '</div>').appendTo( $li ).find('.progress-bar');
	    }
	    $li.find('p.state').text('上传中');
	    $percent.css( 'width', percentage * 100 + '%' );
	});
	
	uploader.on( 'uploadSuccess', function( file ) {
	    $( '#'+file.id ).find('p.state').text('已上传');
	});
	
	uploader.on( 'uploadError', function( file ) {
	    $( '#'+file.id ).find('p.state').text('上传出错');
	});
	
	uploader.on( 'uploadComplete', function( file ) {
	    $( '#'+file.id ).find('.progress').fadeOut();
	});
	
	uploader.on( 'all', function( type ) {
	    if ( type === 'startUpload' ) {
	        state = 'uploading';
	    } else if ( type === 'stopUpload' ) {
	        state = 'paused';
	    } else if ( type === 'uploadFinished' ) {
	        state = 'done';
	    }
	
	    if ( state === 'uploading' ) {
	        $btn.text('暂停上传');
	    } else {
	        $btn.text('开始上传');
	    }
	});

	uploader.on('error', function(handler) {
		if(handler == 'Q_EXCEED_NUM_LIMIT' ) {
			alert("您上传的图片数量过多!");
		}
		if(handler == 'F_EXCEED_SIZE') {
			alert("您上传的文件过大!");
		}
		if(handler == 'Q_TYPE_DENIED') {
			alert("您上传的文件格式不正确!");
		}
	});
}

function autoUpload(uploader, fileList,thumbnailWidth, thumbnailHeight,options) {
	var $ = jQuery,
    $list = $('#' + fileList ),
    // 优化retina, 在retina下这个值是2
    ratio = window.devicePixelRatio || 1,
    // 缩略图大小
    thumbnailWidth = thumbnailWidth || (100 * ratio),
    thumbnailHeight = thumbnailHeight || (100 * ratio);
	// 当有文件添加进来的时候
	uploader.on( 'fileQueued', function( file ) {
	    var $li = $(
	            '<div id="' + file.id + '" class="file-item thumbnail">' +
	                '<img >' +
	                //'<div class="info">' + file.name + '</div>' +
	            '</div>'
	            ),
	        $img = $li.find('img');
	    $list.html( $li );
	    $list.css("margin-top","-40px");
		$list.parent().find(".webuploader-pick").hide();
	    // 创建缩略图
	    uploader.makeThumb( file, function( error, src ) {
	        if ( error ) {
	            $img.replaceWith('<span>不能预览</span>');
	            try{
		        	options.afterQueued();
		        }catch(e){
		        }
	            return;
	        }
	        $img.attr( 'src', src );
	    }, thumbnailWidth, thumbnailHeight );
	    
	    try{
        	options.afterQueued();
        }catch(e){
        }
        return;
	});
	
	// 文件上传过程中创建进度条实时显示。
	uploader.on( 'uploadProgress', function( file, percentage ) {
	    var $li = $( '#'+file.id ),
	        $percent = $li.find('.progress span');
	
	    // 避免重复创建
	    if ( !$percent.length ) {
	        $percent = $('<p class="progress"><span></span></p>')
	                .appendTo( $li )
	                .find('span');
	    }
	
	    $percent.css( 'width', percentage * 100 + '%' );
	});
	
	// 文件上传成功，给item添加成功class, 用样式标记上传成功。
	//resporse函数回调值
	uploader.on( 'uploadSuccess', function( file, resporse ) {
		if(resporse.statusCode != 6){
			var $li = $( '#'+file.id ),
	        $success = $li.find('div.success');
			var inputName = $li.parent().attr("id").substring(0 ,$li.parent().attr("id").length-3);
			$("input[name=" + inputName + "]").val(resporse.data);
			// 避免重复创建
		    if ( !$success.length ) {
		        $success = $('<div class="success"></div>').appendTo( $li );
		    }
		    
		    $success.empty();
			$success.append("<a href='javascript:void(0)' style='color:white;'>上传成功</a>");
			$li.mouseover(function (){
				$success.find("a").html("重新上传");
			});
			$li.mouseleave(function(){
				$success.find("a").html("上传成功");
			});
		    $li.find('div.info').parent().find("img").wrap("<a href='" + resporse.data + "' target=_blank/>");
		    $li.find('div.info').hide();
		}  else {
			var $li = $( '#'+file.id ),
			$error = $li.find('div.error-picture');

			// 避免重复创建
			if ( !$error.length ) {
				$error = $('<div class="error"><a class="error-picture" style="color:red"></a></div>').appendTo( $li.find(".img-wrap") );
			}
	
			if($li.find("p").length > 0){
				$li.find("p").remove();
			}
	
			$error.text('上传失败').css({"color":"#ff0000"});
	
			$error.closest(".img-wrap").mouseover(function (){
				$error.html('重新上传').css({color:"#ffffff"});
			});
			$error.closest(".img-wrap").mouseleave(function(){
				$error.html("上传失败").css({"color":"#ff0000"});
			});
			
			//上传失败回调
			try{
				options.afterError(file, resporse.data);
			}catch(e){
			}
		}
		
		try{
			options.afterSuccess(file, resporse.data);
		}catch(e){
		}
	   /* $success.text(resporse.statusMessage);
	    
		
    	setTimeout(function(){
    		$("#filePicker2").find("label").hide();
    		$success.empty();
    		$success.append("<a href='javascript:void(0)' onclick='reUpload(" + $li.parent().attr("id") + ")' style='color:white;'>上传成功</a>");
        	$list.parent().mouseover(function (){
        		$success.find("a").html("重新上传");
        		});
        	$list.parent().mouseleave(function(){
        		$success.find("a").html("上传成功");
        	});
    	},1000);*/
	
	});
	
	// 文件上传失败，现实上传出错。
	uploader.on( 'uploadError', function( file, resporse) {
		var $li = $( '#'+file.id ),
	        $error = $li.find('div.error');
	
	    // 避免重复创建
	    if ( !$error.length ) {
	        $error = $('<div class="success" style="color:red"></div>').appendTo( $li );
	        // $error = $li.append($('<div class="error" style="color:red"></div>'));
			
		}
		// $error.text('上传失败');
		Pingan.malertInfo('上传失败!','infoMessage warning',{});
		$error.append("<a class='success' href='javascript:void(0)' onclick='reUpload(" + $li.parent().attr("id") + ")' style='color:red;'>重新上传</a>");
	});
	
	uploader.on('error', function(handler) {
		if(handler == 'Q_EXCEED_NUM_LIMIT' ) {
			Pingan.malertInfo('您上传的图片数量过多!','infoMessage warning',{});

		}
		if(handler == 'F_EXCEED_SIZE') {
			Pingan.malertInfo('您上传的文件过大!','infoMessage warning',{});
		}
		if(handler == 'Q_TYPE_DENIED') {
			Pingan.malertInfo('您上传的文件格式不正确!','infoMessage warning',{});

		}
	});
	
	// 完成上传完了，成功或者失败，先删除进度条。
	uploader.on( 'uploadComplete', function( file ) {
	    $( '#'+file.id ).find('.progress').remove();
	});
}
define(['js/lib/webUpload/webuploader'],function (WebUploader){
	return {WebUploader : WebUploader};
});
