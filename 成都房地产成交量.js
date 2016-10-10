var http = require("http"),
	url = require("url"),
	superagent = require("superagent"),
	cheerio = require("cheerio"),
	async = require("async"),
	eventproxy = require('eventproxy'),
	charset = require('superagent-charset');

var ep = new eventproxy();

var deleteRepeat = {},	//去重哈希数组
	urlsArray = [],	//存放爬取网址
	catchDate = [],	//存放爬取数据
	pageUrls = [],	//存放收集文章页面网站
	pageNum = 70,	//要爬取文章的页数
	startDate = new Date(),	//开始时间
	endDate = false;	//结束时间

for(var i=1 ; i<= pageNum ; i++){
	pageUrls.push('http://newhouse.cd.fang.com/house/web/newhouse_news_more.php?type=12193&page='+ i);
}

charset(superagent);
console.log('charset set!!');


// 判断作者是否重复
function isRepeat(authorName){
	if(deleteRepeat[authorName] == undefined){
		deleteRepeat[authorName] = 1;
		return 0;
	}else if(deleteRepeat[authorName] == 1){
		return 1;
	}
}

// 主start程序
function start(){
	function onRequest(req, res){
		// 设置字符编码(去掉中文会乱码)
		res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
		// ep.after('ChengduDataCollectionDidFinish',pageUrls.length*20,function(articleUrls){
		
		pageUrls.forEach(function(pageUrl){
			superagent.get(pageUrl)
				.charset('gbk')
				.end(function(err,pres){
					console.log('[Access] page ' + pageUrl + ' successful');
					res.write('[Access] page ' + pageUrl + ' successful<br/>');
		      		if (err) { console.log('Error: ' + err); }

					var $ = cheerio.load(pres.text);
					$('.lnews').children().first().children().map(function(i, li){
						var strTitle = $(this).find('a').first().attr('title')
						var reg = /住宅(备案)?成交([0-9]+)套/;
						var res = reg.exec(strTitle);
						if (res != null) {
							var intQuantity = res[1];
							console.log('[Matched res] Title: ' + strTitle + ' Quantity: ' + intQuantity);
							var strDate = $(this).find('span').first();
						} else {
							console.log('[NOT Matched] ' + strTitle)
							return null;
						}
					});

					// ep.emit('ChengduDataCollectionDidFinish', articleUrl);
				})
		})
	}

	http.createServer(onRequest).listen(3002);
}

exports.start= start;