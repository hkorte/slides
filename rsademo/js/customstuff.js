(function () {
	var gcd = function (a, b) {
		if (a < 0) {
			a = -a;
		}
		if (b < 0) {
			b = -b;
		}
		if (b > a) {
			var temp = a;
			a = b;
			b = temp;
		}
		while (true) {
			a %= b;
			if (a == 0) {
				return b;
			}
			b %= a;
			if (b == 0) {
				return a;
			}
		}
	};

	var inverse = function (a, n) {
		var t = 0;
		var newt = 1;
		var r = n;
		var newr = a;
		var tmp = 0;
		while (newr != 0) {
			var quotient = Math.floor(r / newr);
			tmp = newt;
			newt = t - quotient * newt;
			t = tmp;
			tmp = newr;
			newr = r - quotient * newr;
			r = tmp;
		}
		if (r > 1) {
			console.log("NOT INVERTIBLE!");
		}
		if (t < 0) {
			t = t + n;
		}
		return t;
	};

	var maxValue = 10000; // ignore input values larger than that to avoid browser problems.

	var updateValues = function () {
		var pintval = parseInt($("#pvalue").val());
		var qintval = parseInt($("#qvalue").val());
		var eintval = parseInt($("#evalue").val());
		var mintval = parseInt($("#mvalue").val());
		if (isNaN(pintval) || isNaN(qintval) || isNaN(eintval) || isNaN(mintval)) {
			return;
		}
		if (pintval > maxValue || qintval > maxValue || eintval > maxValue || mintval > maxValue) {
			return;
		}
		var p = new BigInteger(pintval);
		var q = new BigInteger(qintval);
		var pqprimes = p.isProbablePrime() && q.isProbablePrime();
		if (pqprimes) {
			var n = new BigInteger(p * q);
			var phiP = p - 1;
			var phiQ = q - 1;
			var phiN = phiP * phiQ;
			var e = eintval;
			if (e > 0) {
				var gcdEphiN = gcd(e, phiN);
				if (gcdEphiN == 1) {
					var d = inverse(e, phiN);
					var m = new BigInteger(mintval);
					if (0 <= m.intValue() && m.intValue() < n.intValue()) {
						var c = m.modPow(new BigInteger(e), n);
						var m2 = c.modPow(new BigInteger(d), n);
						var mPowE = m.pow(new BigInteger(e));
						var cPowD = c.pow(new BigInteger(d));
						var mPowEdivN = mPowE.divide(n);
						var cPowDdivN = cPowD.divide(n);
						var nTimesMPowEdivN = n.multiply(mPowEdivN);
						var nTimesCPowDdivN = n.multiply(cPowDdivN);
					}
				}
			}
		}
		$("span.demovalue").css({ opacity: 0 });
		$(".pspan").html(p + "");
		$(".qspan").html(q + "");
		$(".nspan").html(n + "");
		$(".espan").html(e + "");
		$(".dspan").html(d + "");
		$(".mspan").html(m + "");
		$(".cspan").html(c + "");
		$(".m2span").html(m2 + "");
		$(".phipspan").html(phiP + "");
		$(".phiqspan").html(phiQ + "");
		$(".phinspan").html(phiN + "");
		$(".gcdephinspan").html(gcdEphiN + "");
		$(".cpowdspan").html(cPowD + "");
		$(".mpowespan").html(mPowE + "");
		$(".cpowddivnspan").html(cPowDdivN + "");
		$(".mpowedivnspan").html(mPowEdivN + "");
		$(".ntimesmpowedivnspan").html(nTimesMPowEdivN + "");
		$(".ntimescpowddivnspan").html(nTimesCPowDdivN + "");
		$("span.demovalue").animate({ opacity: 1 }, 1000);

		// constraint: p != q
		if (!p.equals(q)) {
			$("#constraint_pqdistinct").removeClass("alert");
		} else {
			$("#constraint_pqdistinct").addClass("alert");
		}

		// constraint: p and q primes
		if (pqprimes) {
			$("#constraint_pqprime").removeClass("alert");
		} else {
			$("#constraint_pqprime").addClass("alert");
		}

		// constraint: 1<e<φ(n)
		if (1 < e && e < phiN) {
			$("#constraint_e").removeClass("alert");
		} else {
			$("#constraint_e").addClass("alert");
		}

		// constraint: gcd(e,φ(n))=1
		if (gcdEphiN == 1) {
			$("#constraint_gcd").removeClass("alert");
		} else {
			$("#constraint_gcd").addClass("alert");
		}

		// constraint: 0≤m<n
		if (m != undefined && 0 <= m.intValue() && m.intValue() < n.intValue()) {
			$("#constraint_m").removeClass("alert");
		} else {
			$("#constraint_m").addClass("alert");
		}
	};

	$("#pvalue").keyup(updateValues);
	$("#qvalue").keyup(updateValues);
	$("#evalue").keyup(updateValues);
	$("#mvalue").keyup(updateValues);
	updateValues();
})();

$("#ImplisenseInfoExtractorForm").submit(function (e) {
	console.log("start");
	$("#ImplisenseInfoExtractorResults").fadeOut('fast');
	var url = $("#ImplisenseInfoExtractorForm input[type=text]").val();
	$.ajax({
		url: "http://dev.implisense.com/hjf5s-d/Xzu$kGEW/api/infop",
		type: "GET",
		data: {
			'url': url
		},
		dataType: 'jsonp',
		jsonp: 'callback',
		jsonpCallback: 'jsonpCallback',
		success: function () {
		}
	});
	e.preventDefault(); // STOP default action
});

function jsonpCallback(data) {
	console.log("CALLBACK!");
	console.log(data);
	var div = $("#ImplisenseInfoExtractorResults").html('');
	if (data.error) {
		$('<span/>').text(data.errorMessage).appendTo(div);
	} else {
		var info = data.companyInformation;
		$('<span/>').text(info.name).appendTo(div);
		$('<br/>').appendTo(div);
		$('<span/>').text(info.street).appendTo(div);
		$('<br/>').appendTo(div);
		$('<span/>').text(info.zip).appendTo(div);
		div.append(" ");
		$('<span/>').text(info.city).appendTo(div);
		// if (info.phoneNumber) {
		// $('<br/>').appendTo(div);
		// $('<span/>').text(info.phoneNumber).appendTo(div);
		// }
		// if (info.court && info.regNum) {
		// $('<br/>').appendTo(div);
		// $('<span/>').text(info.regNum).append('<br/>').append(info.court).appendTo(div);
		//		}
	}
	$("#ImplisenseInfoExtractorResultsContainer span.glyphicon").addClass("glyphicon-arrow-down");
	$("#ImplisenseInfoExtractorResults").fadeIn('fast');
}