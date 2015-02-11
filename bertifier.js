/*
###################################################################
GLOBAL CONSTANTS
###################################################################
*/
var lcommands = 7; //commande à gauche
var rcommands = 0; //commande à droite
var tcommands = 2; //commande en haut
var bcommands = 0; //commande en bas
var rowcommands = lcommands + rcommands;
var columncommands = tcommands + bcommands;

/*
###################################################################
DRAG/DROP
###################################################################
*/

/*permet d'effectuer un drag & drop sur les lignes et sur les colonnes.
La fonction sur les lignes est trivial mais le drag & drop sur les colonnes nécessitent
d'écrire un peu de code
*/
function dragdrop()
{
	$('.bertifyme>tbody').sortable({
		items: "tr",
		handle : "td"
	});
	
	var oldIndex;
	var newIndex;
	$('.bertifyme>thead').sortable({
		items: "th:not('.bcontrol'):not('.bInactive')",
		axis: "x",
		start: function(event, ui){
			oldIndex = ui.item.index();
		},	
		stop: function(event, ui){
			var field, newIndex = ui.item.index();
			if(newIndex != oldIndex)
			ui.item.closest('table').find('tbody tr').each(function (i, row) {
			row = $(row);
			field = row.children().eq(oldIndex);
			if(newIndex)
			{
				if (oldIndex < newIndex)
					row.children().eq(newIndex).after(field);
				else
					row.children().eq(newIndex).before(field);
			}  
			else row.prepend(field);
		  })
		}
	});
}
/*
###################################################################
SELECTING
###################################################################
*/
function selectBody(){
	var col;
	$("#beautifyme>tbody").selectable({
		delay : 50,
		filter: "th.bcontrol",
		stop: function(event, ui) {
			col = undefined;
			$("th").removeClass("ui-selected");
		},
		selected : function(event, ui) {
			$(ui.selected).find(".ui-slider").each(function(index, element) {
				th = $(element).closest("th");
				$(th).css('height',$(element).slider("value")+"px");
			});
		},
		selecting: function(event, ui) {
			if (col === undefined)
				col = $(ui.selecting).index();
			col2 = $(ui.selecting).index();
			if (col != col2)
				$(ui.selecting).removeClass("ui-selecting");
			else
				$(ui.selecting).click();
		},
		unselecting: function(event, ui) {
			if (col === undefined)
				col = $(ui.unselecting).index();
			col2 = $(ui.unselecting).index();
			if (col != col2)
				$(ui.unselecting).removeClass("ui-selecting");
			else
			{
				if ($(ui.unselecting).hasClass("bcontrolRowHeader"))
					$(ui.unselecting).click();
				else
					$(ui.unselecting).parent().find("th.bcontrolRowText").click();
			}
		}		
	});
}

function selectHead(){
	var row
	$("#beautifyme>thead").selectable({
		delay : 50,
		filter: "th.bcontrol",
		stop: function(event, ui) {
			row = undefined;
			$("th").removeClass("ui-selected");
		},
		selected : function(event, ui) {
			$(ui.selected).find(".ui-slider").each(function(index, element) {
				th = $(element).closest("th");
				$(th).css('min-width',$(element).slider("value")+"px");
			});
		},
		selecting: function(event, ui) {
			if (row === undefined)
				row = $(ui.selecting).closest("tr").index();
			row2 = $(ui.selecting).closest("tr").index();
			if (row != row2)
				$(ui.selecting).removeClass("ui-selecting");
			else
			{
				if (!$(ui.selecting).hasClass("bChecked"))
					$(ui.selecting).click();
			}
		},
		unselecting: function(event, ui) {
			if (row === undefined)
				row = $(ui.unselecting).closest("tr").index();
			row2 = $(ui.unselecting).closest("tr").index();
			if (row != row2)
				$(ui.unselecting).removeClass("ui-selecting");
			else
			{
				if ($(ui.unselecting).hasClass("bcontrolColHeader"))
					$(ui.unselecting).click();
				else
					$(ui.unselecting).parent().find("th.bcontrolRowText").click();
			}
		}		
	});
}

/*
###################################################################
COMMONS
###################################################################
*/

function addRowCommand(tr, classes, child)
{
	th = $("<th></th>").addClass("bcontrol");
	for ( i = 0 ; i < classes.length ; i++)
	{
		$(th).addClass(classes[i]);
	}
	$(child).appendTo(th);
	$(th).prependTo(tr);
}


function getMinHW(tbody)
{
	min = Number.MAX_VALUE;
	$(tbody).find('tr').each(function(){
		iterateRow( $(this) , "bcontrol", function(td){
			min = Math.min(min,$(td).height());
			min = Math.min(min,$(td).width());
		});
	});
	return min
}

/*
permet d'itérer sur tous les tds d'un tr donné
en appliquant la fonction func sur chaque élément.
on peut filter par classe en renseignant le paramètre filter
*/
function iterateRow( tr , exclude, func)
{
	$(tr).find('td').each(function(index, element){
		if (exclude && !$(this).hasClass(exclude))
			func(element);
	});
}

/*
permet d'itérer sur une colonne d'une table
en appliquant la fonction func sur chaque élément
la fonction func a le prototype suivant : func(element)
*/
function iterateCol( table , index, exclude, func)
{
	tds = 'td:nth-child('+index+')';
	$(table).find(tds).each(function(index, element){
		if (exclude && !$(this).hasClass(exclude))
			func(element);
	});
}

/*
permet de récupérer la valeur min et max d'une ligne de table
retourne un tableau [min;max]
*/
function getMinMaxRow(tr)
{
	min = Number.MAX_VALUE;
	minP1 = Number.MAX_VALUE;
	max = 0;
	iterateRow($(tr), "bheader" , function(td){
		
		if ($.isNumeric($(td).text()))
		{
			num = Number($(td).text().split(' ').join(''));
			min = Math.min(min,num);
			if (num>=min && minP1 > num)
				minP1 = num;
			max = Math.max(max,num);
		}
	});
	return [min, max, minP1];
}

/*
permet de retourner la valeur min et max d'une colonne d'un tableau
retourne un tableau [min;max]
*/
/*function getMinMaxColumn(td)
{
	min = Number.MAX_VALUE;
	max = 0;
	table = $(td).parent().parent().parent();
	idx = td.index() + 1;
	tds = 'td:nth-child('+idx+')';
	iterateCol($(table), idx, "bheader", function(td){
		if ($.isNumeric($(td).text()))
		{
			num = Number($(td).text().split(' ').join(''));
			max = Math.max(max,num);
			min = Math.min(min,num);
		}
	});
	return [min, max];
}
*/

/*
###################################################################
BERTIFIER
###################################################################
*/

//permet de créer un slider vertical
function makeVerticalSlider()
{
	slider = 
	$("<div></div>").slider({
		orientation: "vertical",
		min: 0,
		max: 500,
		value : 0,
		stop: function( event, ui ) {
			th = $(event.target).closest("th");
			$(th).css('min-width',ui.value+"px");
		}
		})
		.mouseover(function(e) {
			var height = $(this).height();
			var offset = $(this).offset();
			var options = $(this).slider('option');
			var value = options.max - Math.round(((e.clientY - offset.top) / height) *
			(options.max - options.min)) + options.min;
			$(this).closest("tr").find(".ui-slider").each(function(index, element){
				if ($(element).closest("th").hasClass("ui-selecting"))
					$(element).slider("value",value);
			});
		});
	return slider;
}

//permet de créer un slider horizontal
function makeHorizontalSlider()
{
	slider = 
	$("<div></div>").slider({
		orientation: "horizontal",
		min: 0,
		max: 500,
		value : 0,
		stop: function( event, ui ) {
			th = $(event.target).closest("th");
			$(th).css('height',ui.value+"px");
		}
		})
		.mouseover(function(e) {
			var width = $(this).width();
			var offset = $(this).offset();
			var options = $(this).slider('option');
			var value = Math.round(((e.clientX - offset.left) / width) *
			(options.max - options.min)) + options.min;
			
			table = $(this).closest("table");
			idx = $(this).index()+1;
			tds = 'th:nth-child('+idx+')';
			$(table).find(tds).each(function(index, element){
				$(element).find(".ui-slider").each(function(index, element){
					if ($(element).closest("th").hasClass("ui-selecting"))
						$(element).slider("value",value);
				});
			});
		});
	return slider;
}

/*
permet d'ajouter des colonnes de commandes au tableau bertifié
*/
function addColumns(object)
{
	tbody = $(object).find("tbody");
	thead = $(object).find("thead");
	//on cherche à partir de l'objet passé en paramètre toutes les balises tr
	tbody.find('tr').each(function(index)
	{
		//pour chaque balise tr on ajoute au début et à la fin les commandes correspondantes
		circle = $("<svg width='20' height='20'><circle cx='10' cy='10' r='8'></circle></svg>");
		rect = $("<svg width='20' height='20'><rect width='20' height='10' x='0' y ='5'></rect></svg>");
		line = $("<svg width='20' height='20'><line x1='0' y1='10' x2='10' y2='10' style='stroke:rgb(0,0,0);stroke-width:2' /></svg>");
		header = $("<img src='./img/header.png' height='15' width='15'>");
		baseline = $("<img src='./img/baseline.png' height='20' width='20'>");
		slider = makeHorizontalSlider();

		addRowCommand($(this), ["bcontrolRowCircle", "bcontrolShape"], circle); 
		addRowCommand($(this), ["bcontrolRowRect", "bcontrolShape"], rect);
		addRowCommand($(this), ["bcontrolRowLine", "bcontrolShape"], line);
		addRowCommand($(this), ["bcontrolRowBaseline", "bcontrolShape"], baseline);
		addRowCommand($(this), ["bcontrolRowHeader"], header);
		addRowCommand($(this), ["bcontrolRowText"], $("<p>text</p>"));
		addRowCommand($(this), ["bcontrolRowResize"], $(slider));
		
	});
	thead.find('tr').each(function(index)
	{
		for( i = 0 ; i < lcommands ; i++)
			$("<th></th>").prependTo($(this));
	});
}

/*
permet d'ajouter des lignes de commandes au tableau bertifié
*/
function addRows(object)
{
	//on ajoute les commandes dans la partie thead du tableau
	thead = $(object).find('thead');
	tbody = $(object).find('tbody');
	//premier tr du thead
	columns = $(tbody).find("tr")[0].cells.length;
	
	rowResize = $("<tr class='bcontrolCol'></tr>");
	rowHeader = $("<tr class='bcontrolCol'></tr>");
	
	for( i = 0 ; i < columns ; i++)
	{
		if (i >= lcommands && i < columns - rcommands)
		{
			resize = $("<th class='bcontrol bcontrolColResize' ></th>");
			slider = makeVerticalSlider();
			$(slider).appendTo(resize);
			$(resize).appendTo(rowResize);
			
			header = "<img src='./img/header.png' height='15' width='15'>";
			$(rowHeader).append("<th class='bcontrol bcontrolColHeader' >"+header+"</th>");
		}
		else
		{
				$(rowHeader).append("<th class='bInactive'></th>");
				$(rowResize).append("<th class='bInactive'></th>");
		}
	}
	rowHeader.prependTo(thead);
	rowResize.prependTo(thead);
}

/*
###################################################################
FIGURES
###################################################################
*/

function addCircleOnClick()
{
	var minHW;
	//permet d'activer la création de cercle sur une ligne 
	$('.bcontrolRowCircle').bind("click", function() {
		$(this).parent().find(".bcontrolRowText").click();
		$(this).addClass("bChecked");
		tr = $(this).parent();
		bound = getMinMaxRow(tr);
		
		if (!minHW)
			minHW = getMinHW($(tr).parent());
		maxRadiusCircle = Math.sqrt( minHW*minHW + minHW*minHW ) / 2;
		minRadiusCircle = maxRadiusCircle / 2;
		size = (bound[1] - bound[2])/(maxRadiusCircle - minRadiusCircle);
		
		iterateRow($(tr), "bheader", function(td){
			if (!$(td).hasClass("hide-text"))
				addCircleToTd($(td), bound, size, minHW);
		});
	});
}

function addCircleToTd(td, bound, size, minHW)
{
	if (!$(td).hasClass('bcontrol'))
		$(td).find('svg').remove();
	if ($(td).find('svg').length == 0 && $.isNumeric($(td).text()))
	{
		num = Number($(td).text().split(' ').join(''));
		
		if (num == bound[0]){
			$(td).addClass("hide-text");
			return;
		}
		
		radius = minRadiusCircle + (num -  bound[2]) / size; 

		svg = $('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
		$(svg).attr("height", minHW);
		$(svg).attr("width", minHW);
		circle = Pablo.circle({
		cx: minHW / 2,
		cy: minHW / 2,
		r:radius
		})
		.addClass('bshape')
		.appendTo(svg);
		svg.appendTo(td);
		$(td).addClass("hide-text");
	}
}

function addRectOnClick()
{
	$('.bcontrolRowRect').bind("click", function() {
		$(this).parent().find(".bcontrolRowText").click();
		$(this).addClass("bChecked");

		tr = $(this).parent();
		bound = getMinMaxRow(tr);
		size = (bound[1]-bound[2]) / $(this).height();
		
		iterateRow($(tr), "bheader", function(td){
			addRectToTd($(td), bound, size);
		});
	});	
}

function addRectToTd(td, bound, size)
{
	if ($(td).find('svg').length == 0 && $.isNumeric($(td).text()))
	{
		num = Number($(td).text().split(' ').join(''));
		if (num == bound[0]){
			$(td).addClass("hide-text");
			return;
		}
		length = 5 + (num -  bound[0]) / size; 
		svg = $('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
		$(svg).attr("height",$(td).height());
		$(svg).attr("width",$(td).width());
		
		rect = Pablo.rect({
			width: $(td).width(),
			height: length,
			x : 0,
			y : $(td).height() - length
		})
		.addClass('bshape')
		.appendTo(svg);
		svg.appendTo(td);

		$(td).addClass("hide-text");
	}
}

/*
permet de retourner la distance la plus élevée à gauche et à droite de la moyenne.
Retourne un tableau correspondant à la distance max à gauche et la distance max à droite.
*/
function maxDistAverage(tr , average)
{
	var maxDLeft = 0.0;
	var maxDRight = 0.0;
	iterateRow($(tr), "bheader", function(td){
		
		intRegex = new RegExp(/[0-9 ]+$/);
		if ($.isNumeric($(td).text()))
		{
			num_ = Number($(td).text().split(' ').join(''));
			if (num_ < average)
			{
				distLeft = distAverage(num_,average);
				if (distLeft > maxDLeft)
					maxDLeft = distLeft;
			}
			if (num_ > average)
			{
				distRight = distAverage(num_,average);
				if (distRight > maxDRight)
					maxDRight = distRight;
			}				
		}
	});
	return [maxDLeft , maxDRight];
}

function distAverage(value, average)
{
	return Math.abs(value - average);
}

function addBaselineOnClick()
{
	$('.bcontrolRowBaseline').bind("click", function() {
		$(this).parent().find(".bcontrolRowText").click();
		$(this).addClass("bChecked");

		tr = $(this).parent();
		
		average = 0, count = 0;
		
		iterateRow($(tr), "bheader", function(td){
			
			if ($.isNumeric($(td).text()))
			{
				count++;
				num = Number($(td).text().split(' ').join(''));
				average += num;
			}
		});
		average /= count;
		
		elements = maxDistAverage(tr , average);
		
		iterateRow($(tr), "bheader", function(td){
			addBaselineToTd($(td), elements, average);
		});
	});	
}

function addBaselineToTd(td, elements, average)
{
	if ($(td).find('svg').length == 0 && $.isNumeric($(td).text()))
	{
		num = Number($(td).text().split(' ').join(''));

		svg = $('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
		$(svg).attr("height",$(td).height());
		$(svg).attr("width",$(td).width());
		
		coefLeft = 0;
		coefRight = 0;
		if (elements[0] < elements[1])
		{
			coefLeft = elements[0] / elements[1];
			coefRight = 1;
		}
		else
		{
			coefLeft = 1;
			coefRight = elements[1] / elements[0];
		}
		
		if (num < average)
		{
			dist = distAverage(num, average);
			length = dist * $(td).height() / elements[0] * coefLeft;
			rect = Pablo.rect({
				width: $(td).width(),
				height: length,
				x : 0,
				y : $(td).height() - length
			});
			rect.addClass("bleftBaseline").appendTo(svg);
		}
		else
		{
			dist = distAverage(num, average);
			length = dist * $(td).height() / elements[1] * coefRight;
			
			rect = Pablo.rect({
				width: $(td).width(),
				height: length,
				x : 0,
				y : $(td).height() - length
			});			
			rect.addClass("brightBaseline").appendTo(svg);
		}
		svg.appendTo(td);
		$(td).addClass("hide-text");
	}	
}


function addLineOnClick()
{
	$('.bcontrolRowLine').bind("click", function() {

		$(this).parent().find(".bcontrolRowText").click();
		$(this).addClass("bChecked");
		
		tr = $(this).parent();
		bound = getMinMaxRow(tr);
		size = (bound[1]-bound[2]) / $(this).height();
		iterateRow($(tr), "bheader", function(td)
		{
			if ($(td).find('svg').length == 0 && $.isNumeric($(td).text()))
			{
				num = Number($(td).text().split(' ').join(''));
				if (num == bound[0]){
					$(td).addClass("hide-text");
					return;
				}
				
				length =(num -  bound[2]) / size; 
				svg = $('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
				$(svg).attr("height",$(td).height());
				$(svg).attr("width",$(td).width());
				$(svg).attr("style",'stroke:rgb(0,0,0);stroke-width:3');
				
				line = Pablo.line({
					width: $(td).width(),
					height: length,
					x1 : 0,
					y1 : $(td).height() - length  ,
					x2 : $(td).width(),
					y2 : $(td).height() - length  
					
				})
				.addClass('bshape')
				.appendTo(svg);
				svg.appendTo(td);
		
				$(td).addClass("hide-text");
			}
		});
	
		
	});	
}

function addHeaderOnClick()
{
	$('.bcontrolRowHeader').bind("click", function() {
		
		if (!$(this).hasClass("bChecked"))
			$(this).addClass("bChecked");
		else
			$(this).removeClass("bChecked");
		
		tr = $(this).parent();
		
		iterateRow($(tr), "bcontrol", function(td){
			if (!$(td).hasClass("bheader"))
			{
				$(td).addClass("bheader");
				$(tr).find('.bcontrolRowText').click();
			}
			else 
			{
				$(td).removeClass("bheader");	
			}
		});
	});
	$('.bcontrolColHeader').bind("click", function() {
		table = $(this).parent().parent().parent();
		idx = $(this).index() + 1;
		tds = 'td:nth-child('+idx+')';
		
		if ($(this).hasClass("bChecked"))
			$(this).removeClass("bChecked");
		else $(this).addClass('bChecked');
		
		iterateCol($(table).find('tbody'), idx, "bcontrol", function(td){
			if ($(td).hasClass("bheader"))
				$(td).removeClass("bheader");
			else 
			{
				$(td).addClass("bheader");
				$(td).removeClass("hide-text");
				$(td).find("svg").remove();
			}
		});	
	});
}

function addTextOnClick()
{
	$('.bcontrolRowText').bind("click", function() {
		tr = $(this).parent();
		tr.find('th.bcontrolShape').each(function(){
			if ($(this).hasClass('bChecked'))
				$(this).removeClass('bChecked');
		});
		tr.find('td').each(function(index)
		{
			if (!$(this).hasClass("bcontrol"))
			{
				$(this).find('svg').remove();
				intRegex = new RegExp(/[0-9 -()+]+$/);
				if ($(this).text().match(intRegex))
					$(this).removeClass("hide-text");
			}
		});
		
	});
}

/*
###################################################################
MAIN
###################################################################
*/

$.fn.extend({bertifier: function() {
	addColumns(this);
	addRows(this);
	$(this).addClass("bertifyme");
	addCircleOnClick();
	addRectOnClick();
	addLineOnClick();
	addTextOnClick();
	addHeaderOnClick();
	addBaselineOnClick();
	dragdrop();
	selectBody();
	selectHead();
	return $(this);
}});

