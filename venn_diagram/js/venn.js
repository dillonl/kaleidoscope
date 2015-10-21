var vennPlotID = 'venn';
var init;
var elem;
var dataInput;
var tooltip;
var firstLoad = false;

window.onload = function() {
	if (typeof registerAnalysis == 'function') {
		registerAnalysis(showVennDiagram);
	}

	d3.selection.prototype.moveParentToFront = function() {
		return this.each(function() {
			this.parentNode.parentNode.appendChild(this.parentNode);
		});
	};

}

function showVennDiagram(variants1, variants2) {
	var vennElement;
	if ($('#'+vennPlotID).length) {
		vennElement = $('#'+vennPlotID);
	}
	else {
		$('#plotting-area').append('<div id="' + vennPlotID + '"></div>');
	}
	var tooltip = d3.select("body").append("div").attr("class", "venntooltip");
	partitionVariantSets(variants1, variants2, function (variants1ComplementKeys, variants2ComplementKeys, variantsIntersectionKeys) {
		var firstVCFSize = variants1ComplementKeys.length + variantsIntersectionKeys.length;
		var secondVCFSize = variants2ComplementKeys.length + variantsIntersectionKeys.length;
		var firstVCFLabel = 'First VCF [' + firstVCFSize + ']';
		var secondVCFLabel = 'Second VCF [' + secondVCFSize + ']';

		var sets = [ {sets: [firstVCFLabel], size: variants1ComplementKeys.length + variantsIntersectionKeys.length},
					 {sets: [secondVCFLabel], size: variants2ComplementKeys.length + variantsIntersectionKeys.length},
					 {sets: [firstVCFLabel,secondVCFLabel], size: variantsIntersectionKeys.length }];

		var chart = venn.VennDiagram();
		d3.select("#" + vennPlotID).datum(sets).call(chart);

		var div = d3.select("#" + vennPlotID);
		// add a tooltip


		// add listeners to all the groups to display tooltip on mousover
		div.selectAll("g")
			.on("mouseover", function(d, i) {
				// sort all the areas relative to the current item
				venn.sortAreas(div, d);

				// Display a tooltip with the current size
				tooltip.transition().duration(400).style("opacity", .9);
				tooltip.text(d.size + " variants");

				// highlight the current path
				var selection = d3.select(this).transition("tooltip").duration(400);
				selection.select("path")
					.style("stroke-width", 3)
					.style("fill-opacity", d.sets.length == 1 ? .4 : .1)
					.style("stroke-opacity", 1);
			})

			.on("mousemove", function() {
				tooltip.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
			})

			.on("mouseout", function(d, i) {
				tooltip.transition().duration(400).style("opacity", 0);
				var selection = d3.select(this).transition("tooltip").duration(400);
				selection.select("path")
					.style("stroke-width", 0)
					.style("fill-opacity", d.sets.length == 1 ? .25 : .0)
					.style("stroke-opacity", 0);
			})
			.on('click', function (d, i) {
				console.log(d,i);
			});
	});
}

function intersection(a, b)
{
	var aKeys = Object.keys(a);
	var result = [];
	for (var i = 0; i < aKeys.length; ++i) {
		if (aKeys[i] in b) { result.push(aKeys[i]); }
	}
	return result;
}

function complement(a, b)
{
	var aKeys = Object.keys(a);
	var result = [];
	for (var i = 0; i < aKeys.length; ++i) {
		if (!(aKeys[i] in b)) { result.push(aKeys[i]); }
	}
	return result;
}

function generateVariantMap(variants) {
	var variantsMap = [];
	for (var i = 0; i < variants.length; ++i) {
		var variant = variants[i];
		variantsMap[variant.generateVariantKey()] = variant;
	}
	return variantsMap;
}

function partitionVariantSets(variants1, variants2, callback) {
	var variants1Map = generateVariantMap(variants1);
	var variants2Map = generateVariantMap(variants2);
	var variants1ComplementKeys = complement(variants1Map, variants2Map);
	var variants2ComplementKeys = complement(variants2Map, variants1Map);
	var variantsIntersectionKeys = intersection(variants1Map, variants2Map);
	callback(variants1ComplementKeys, variants2ComplementKeys, variantsIntersectionKeys);
}
