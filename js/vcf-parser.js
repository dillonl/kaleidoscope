var variants1 = [];
var variants2 = [];
var analysisCallbacks = [];

$(document).ready(function() {
	addVCFFileListener('first-vcf', function (variants) {
		variants1 = variants;
	});
	addVCFFileListener('second-vcf', function (variants) {
		variants2 = variants;
	});
});

function addVCFFileListener(vcfFileID, callback) {
	var vcf = document.getElementById(vcfFileID);

	$('#' + vcfFileID).on('change', function(e) {
		var file = vcf.files[0];
		parseVCF(file, function (variants) {
			callback(variants);
			runAnalysis();
		});
	});
}

function variant(chrom, position, ref, alts, info) {
	this.chrom = chrom;
	this.position = position;
	this.ref = ref;
	this.alts = alts;
	this.info = info;
	this.generateVariantKey = function () {
		return this.chrom + "\t" + this.position + "\t" + this.ref + "\t" + this.alts.join();
	};
}

function parseVariant(variantLine) {
	variantSplit = variantLine.split('\t');
	var chrom = variantSplit[0];
	var position = variantSplit[1];
	var ref = variantSplit[3];
	var alts = (variantSplit[4].indexOf(',') > -1) ? variantSplit[4].split(',') : [variantSplit[4]];
	var info = {};
	var infoSplit = variantSplit[7].split(';');
	$.each(infoSplit, function(index, infoField) {
		var keyValue = infoField.split('=');
		info[keyValue[0]] = keyValue[1];
	});
	return new variant(chrom, position, ref, alts, info);
}

function parseVCF(vcf, callback) {
	var fr = new FileReader();
	fr.onload = function() {
		var vcfLines = fr.result.split('\n');
		var variants = [];
		$.each(vcfLines, function (index, variantLine) {
			if (variantLine.startsWith('#') || variantLine.indexOf('\t') == -1) { return; }
			var variant = parseVariant(variantLine);
			variants.push(variant);
		});
		callback(variants);

	};
	fr.readAsText(vcf);
}

function registerAnalysis(analysisCallback) {
	analysisCallbacks.push(analysisCallback);
}

function runAnalysis() {
	if (variants1.length == 0 || variants2.length == 0) {
		return;
	}
	$.each(analysisCallbacks, function(index, callback) {
		callback(variants1, variants2);
	});
}
