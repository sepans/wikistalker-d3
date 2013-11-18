
/*
 *
  using wikipedia sorted data, draws a sunvis in the svg object
 *
 */
 
function SunDrawer(title,data,svg,rayClickCallback,args) {

	var _sddefaults = { width: 600, height: 600, innerCircleR: 100, barMaxSize : 200, showText: 'true'};
	_sdargs = {};
	
	
	var _sddata = data;
	var _sdsvg= svg;

	if(args!=undefined) {
        for(key in _sddefaults) {
             _sdargs[key] = args[key] || _sddefaults[key];
        }
    }
    else {
        _sdargs = _defaults;
    }
    
    


    var drawTheSun = function() {
    
            console.log('dts');

            var width = _sdargs.width;
            var height = _sdargs.height;

            var dataSize = data.length;
            
        
            var innerCircleR = _sdargs.innerCircleR;	 
            var barWidth = Math.max(Math.min(2*Math.PI*innerCircleR/dataSize,80),3); 
            console.log('bar width '+barWidth);
            
        
            var theta = 2*Math.PI/dataSize;
        
            var thetaD = 360/dataSize;
        
            var barMaxSize = _sdargs.barMaxSize;
        
          //  var fontSize = dataSize 
          
          
            

        
            _sdsvg.selectAll(".bar").remove();


            var bars = _sdsvg.selectAll(".bar")
              .data(_sddata)
            .enter().append("g")
              .attr("class", "bar")
              .attr("transform", function(d,index) {  return ' translate('+(width/2+innerCircleR*Math.cos(theta*index))+','+(height/2-innerCircleR*Math.sin(theta*index))+') rotate('+(90-index*thetaD)+')'; })
              .attr('x',0)
              .attr('y',innerCircleR*2)
              .attr('doc-id',function(d) {return d.id;})
              .on("click", function(d,index) { 
               
                   rayClickCallback(d,index,theta);
                   return false;
              })
        //     .attr("text-anchor", function(d,index) { return (index>dataSize/4 && index<3*dataSize/4) ? 'end': 'start';})
              .attr("width", barWidth)
              .attr("height", function(d) { return barMaxSize-d.relatedness*100; });
          

            bars.append("rect")
              .attr("class", ".bar-itself")
              .attr("width", barWidth-2)
              .attr('x',0)
              .attr('y',innerCircleR*2)
              .attr("height", function(d) { return d.relatedness*barMaxSize; });

            

                bars.append('text')
                  .attr("class", "text")
                  .attr('y',-barWidth*0.15)
                  .attr('x',innerCircleR*2)
                  .style('fill-opacity', (_sdargs.showText=='true' && barWidth>7) ? (barWidth-7)/4 : 0 )
                  //.style('background','#555')
        //              .attr("width", barWidth*0.9)
        //              .attr("height", function(d) { return d.relatedness*barMaxSize; })
                  .attr("width", "100%")
                  .attr("height", "100%")
                  .attr("font-size", Math.max(Math.min(barWidth*0.8,18),12))

                //  .attr("height", function(d,index) { return (index>dataSize/4 && index<3*dataSize/4) ? 0 : 100-d.relatedness*100; })
               //  .attr('x',function(d,index) {  return (index>dataSize/4 && index<3*dataSize/4) ? innerCircleR*2 : -innerCircleR*2-d.title.length*5.4; })
                //  .attr("transform", function(d,index) {  return (index>dataSize/4 && index<3*dataSize/4) ? 'rotate(90)' :'rotate(270)';})
                .attr("transform", function(d,index) {  return (index>dataSize/4 && index<3*dataSize/4)? 'rotate(90)' : 'rotate(90)'})
                      
                .text(function(d) { return d.title;})
                  
               .append("svg:title")
              .text(function(d) { return "'"+title+"' and '"+d.title+"' are "+(Math.round(d.relatedness*100))+"% relevant"; });


    }
    
    drawTheSun();

}
//=====================================================

function Wikistalker(args){
	
	var _defaults = {title: 'wikipedia', container: 'body' , width: 600, height: 600,
	             relevance_cutoff : .5, innerCircleR: 100, barMaxSize : 200, sortMethod: 'title'};
	
	 _args = {};
	
	var _wikidata_cache;
	
	var _svg,_smallsvg,historysvg,_cat_g,_the_svg;
	

	var _title_container,_desc_container,_preview_container;
	
	
	for(key in _defaults) {
         _args[key] = args[key] || _defaults[key];
      }
	
	console.log(_args);
	
	var URL_BY_TERM_JSON = '/proxy.php?proxy_url='+'http://wikipedia-miner.cms.waikato.ac.nz/services/exploreArticle?outLinks=true%26definition=true%26linkFormat=plain%26parentCategories=true%26linkRelatedness=true%26responseFormat=json%26title=';
	var URL_BY_ID_JSON = '/proxy.php?proxy_url='+  'http://wikipedia-miner.cms.waikato.ac.nz/services/exploreArticle?outLinks=true%26definition=true%26linkFormat=plain%26parentCategories=true%26linkRelatedness=true%26responseFormat=json%26id=';
	var SORT_METHOD_RELATEDNESS = 'relatedness';
	var SORT_METHOD_TITLE = 'title';
	
	var width = _args.width;
	var height = _args.height;
	
	var nav_history = [];
	

	
	var initialize = function(){
		
		openEntry(_args.id,_args.title);
        
	};
	
	var openEntry = this.openEntry = function(id,title) {
	    var url = id!=undefined ? URL_BY_ID_JSON+id : URL_BY_TERM_JSON+title;

	//	spinner1.spin($('#loading'));
		$('#loading').fadeIn();
		$.getJSON(url, function(data) {
		    _wikidata_cache = data;
		    
		    nav_history.push(data);
		    createVis(data);
		    
		    $('#loading').fadeOut();
		    spinner1.stop();

		});

	}
	
	var relCutoff = function(data,relatedness) {
	
	    if(!(relatedness>=0 && relatedness<=1))
	        relatedness = 0.5;
	    
	    var ret = [];
	    for(var i=0;i<data.length;i++) {
	        if(data[i].relatedness>relatedness && data[i].relatedness!=1) {
	            ret.push(data[i]);
	        }
	    }
	    return ret;
	    
	}
	
	
	var initializeContainers = function(main_container) {
	
	      var innerCircleR = _args.innerCircleR;	 

	    
	     if(_svg==undefined) {
	            _the_svg = d3.select(_args.container).append("svg")
                        .attr("class", "the-main-svg")
                        .attr("x",0)
                        .attr("y",0)
                        .attr("width", 1200)
                        .attr("height",720);
                        

                //console.log(_args.container);
                
                 _svg = _the_svg.append("g")
                        .attr("class", "main-svg")
                        .attr("x",0)
                        .attr("y",0)
                        .attr("width", width)
                        .attr("height",height);
                        
                  // tedundant
                  var small_width = 500;
                  var small_height = 500;

                 _cat_g = _the_svg.append("g")
                        .attr("class", "cat-svg")
                        .attr("width", width)
                        .attr("height",100)
                        .attr("transform", "translate("+(100)+","+40+")");

                 _smallsvg = _the_svg.append("g")
                        .attr("class", "small-svg")
                        .attr("width", 500)
                        .attr("height",500)
                        .attr("transform", "translate("+(_args.width-small_width/2+50)+","+(_args.height/2-small_height/2)+")");
  	                   // .attr("y",_args.width-small_width/2+50);

                 _historysvg =  d3.select(_args.container).append("div")
                        .attr("class", "history-container")
                        .append('svg')
                        .attr("width", 800)
                        .attr("height",700);
                
                $('.history-container').append('<a href="#" class="close">x</a>');
                
                $('.history-container .close').click(function() {
                    $('.history-container').hide();
                    $('#navigate-view').addClass('tab');
                    $('#history-view').removeClass('tab');

                   

                    return false;
                });

                $(main_container).append('<div class="title"></div>');
                $(main_container).append('<div class="desc"></div>');

                $(main_container).append('<div class="preview" title="click to navigate to the new entry!"></div>');
                
                _title_container = $(_args.container).find('.title');
                _desc_container = $(_args.container).find('.desc');
                _preview_container = $(_args.container).find('.preview');
        
                $(_title_container).css('position','absolute');
                $(_title_container).css('left',width/2- innerCircleR*0.7);
                $(_title_container).css('top', height/2 - innerCircleR*0.7);
                $(_title_container).css('text-align', 'center');
                $(_title_container).css('width', innerCircleR*1.5);
                
                $(_desc_container).css('position','absolute');
                $(_desc_container).css('left',width/2 - innerCircleR*0.7);
                $(_desc_container).css('top',height/2  - innerCircleR*0.3);
                $(_desc_container).css('width', innerCircleR*1.5);
                $(_desc_container).css('max-height', innerCircleR*0.95);
                $(_desc_container).css('overflow', 'hidden');
                
                $(_preview_container).css('position','absolute');
                $(_preview_container).css('width','160px');
                $(_preview_container).css('height','85px');
               // $(_preview_container).css('background-color','rgba(255,255,255,0.4)');
                $(_preview_container).css('overflow', 'hidden');
                $(_preview_container).css('display','none');
                $(_preview_container).css('text-align','justify');
                
                    
            }
	
	}

	var drawHistory = this.drawHistory = function() {
	    console.log(nav_history.length);
	    
	    _historysvg.selectAll('g').remove();
	    
	    for(var i=0;i<nav_history.length;i++) {
	        console.log('apending');
	        var historyElement = _historysvg.append('g')
	           .attr('transform','translate('+((i%4)*200)+','+(Math.floor(i/4)*200)+')')
	           .attr('class','history-element')
	           .attr('fill','#FFF')
	           .attr('fill-opacity','0.9')
	           .attr("width", 200)
               .attr("height",200);
                  
            historyElement.append('text')
	           .attr("x", 20)
               .attr("y",20)
	           .attr('fill','#000')
	           .attr('font-size','12px')
               .text(i+'. '+nav_history[i].title);
               
               var hisSorted = sortJson(nav_history[i],SORT_METHOD_TITLE);
               hisSorted = relCutoff(hisSorted,0.5);
               
               new SunDrawer(nav_history[i].title,hisSorted,historyElement,null,{width: 200, height: 200, innerCircleR : 30,barMaxSize: 50, showText: 'false'});

	        
	    
	    }
	    
	    
	}
	
	var drawCategories = function(wikidata){
	    
	     _cat_g.selectAll(".cat").remove();
	   
	    var cats = _cat_g.selectAll(".cat")
               .data(wikidata.parentCategories)
               .enter().append("text")
               .attr("class","cat")
               .attr('fill','#aaa')
               .attr('stroke','none')
               .attr("width",200)
               .attr("height",20)
              // .attr("y",function(d,index) {return (2*(_args.innerCircleR+_args.barMaxSize-20)/wikidata.parentCategories.length)*(index+1);})
               .attr("transform",function (d,index) { return "translate("+(_args.width+100)+","+(((_args.width-150)/wikidata.parentCategories.length)*(index+1))+") rotate(0)";})
               .attr("id",function(d) {return "cat_"+d.id;})
               .text(function(d) {return ''+d.title;})
               .append("svg:title")
                .text(function(d) { return "'"+wikidata.title+"' belongs to the category '"+d.title+"'"; });

	     _cat_g.selectAll(".main_curve").remove();

	    var main_curves = _cat_g.selectAll(".main_curve")
               .data(wikidata.parentCategories)
               .enter().append("path")
                    .attr('class','main_curve')
                  /*
                    .attr('x1',850)
                    .attr('y1',400)
                    .attr('x2',ty)
                    .attr('y2',850)
                */
                    .attr('d',function(d,index) {
                        dsx = 500;
                        dsy = 300+index*5;

                        var translate = $($('.cat')[index]).attr("transform");
                        var tx= translate.match(/translate\((\d+[\.\d+]*),(\d+[\.\d+]*)/)[2];//new RegExp("transform\(\d\,(\d\.\d+)\)").exec(translate);
                        

                        dtx = 890;//parseFloat(ty);
                        dty = tx;
                        var ydisp = dty;
                        return "M " + (dsx) + "," + (dsy) + " C "+dsx+","+dsy+"  "+( dtx-300 )+ "," +( ydisp) +" "+ dtx + "," + dty;


                    })
                    .attr('fill','none')
                    .attr('stroke','#999');

/*
      var cats = _cat_g.selectAll(".cat")
              .data(wikidata.parentCategories)
               .enter().append('foreignObject')
          //     .attr("y",function(d,index) {return (_args.width/wikidata.parentCategories.length)*index;})
               .append("div")
               .attr("xmlns","http://www.w3.org/1999/xhtml")
               .attr("class","cat")
        //       .attr("width",200)
         //      .attr("height",20)
               .attr("css",function(d,index) {return "top: "+(_args.width/wikidata.parentCategories.length)*index+"px; left: 0px";})
        //       .attr("left",function(d,index) {return 500;})
//               .attr("transform","rotate(270)")
               .attr("id",function(d) {return "cat_"+d.id;})
               .text(function(d) {return d.title;});
   
*/   
 	
	}
	
	
	var drawPreviewCategories = function(wikidata){
	
        _the_svg.selectAll('.connect-g').remove();
	    
	    var connect_g = _the_svg.append("g")
                        .attr("class", "connect-g")
                        .attr("width", 1000)
                        .attr("height",1000);
        
        
        for(var i=0;i<wikidata.parentCategories.length;i++) {
        
             var cat = wikidata.parentCategories[i]; 
             if($('#cat_'+cat.id).length>0) {
                
                var translate = $('#cat_'+cat.id).attr("transform");
                var tx= translate.match(/translate\((\d+[\.\d+]*),(\d+[\.\d+]*)/)[2];//new RegExp("transform\(\d\,(\d\.\d+)\)").exec(translate);
                console.log(tx);
            
                connect_g.append("path")
                    .attr('class','cat-line')
                  /*
                    .attr('x1',850)
                    .attr('y1',400)
                    .attr('x2',ty)
                    .attr('y2',850)
                */
                    .attr('d',function() {
                        console.log('d fun');
                        dsx = 850;
                        dsy = 400;
                        

                        dtx = 990;//parseFloat(ty);
                        dty = parseFloat(tx)+35;
                        //var dx = dtx - dsx,
                        //dy = dty - dsy,
                        //dr = Math.sqrt(dx * dx + dy * dy);
                        
                       var ydisp = dty;

                       // return "M " + dsx + "," + dsy + " C 850,400  "+( dtx+200 )+ "," +( dty-200) +" "+ dtx + "," + dty;
                       // return "M " + (dsx) + "," + (dsy) + " C "+dsx+","+dsy+"  "+( dtx+300 )+ "," +( dty-300) +" "+ dtx + "," + dty;
                       return "M " + (dsx) + "," + (dsy) + " C "+dsx+","+dsy+"  "+( dtx-30 )+ "," +( ydisp) +" "+ dtx + "," + dty;


                    })
                    .attr('fill','none')
                    .attr('stroke','#555');
                    
             }
        
        }
	    
	    /*
	    var cats = _cat_g.selectAll(".cat")
               .data(wikidata.parentCategories)
               .enter().append("text")
               .attr("class","cat")
               .attr("width",200)
               .attr("height",20)
               .attr("y",function(d,index) {return (_args.width/wikidata.parentCategories.length*(index+1))+10;})
               .attr("transform","rotate(270)")
               .attr("id",function(d) {return "cat_"+d.id;})
        */
  
 	
	}
	
	
	var createVis = this.createVis = function(wikidata) {

		    if(wikidata==undefined)  {
		        wikidata = _wikidata_cache;
		    }
		    
		        
		    var description = wikidata.definition;
		    var title = wikidata.title;
		    
		    var sorted = sortJson(wikidata,_args.sortMethod);

/*
            console.log('sorted links before cuttoff');      
            console.log(sorted);      
            console.log('****** co '+_args.relevance_cutoff);
            console.log(_args);
*/		    
		    sorted= relCutoff(sorted,_args.relevance_cutoff);
		   

            
            
            
             initializeContainers(_args.container);    
            
  
            
            $(_title_container).text(title);
            $(_desc_container).html(description);
            
            drawCategories(wikidata);
            
            new SunDrawer(title,sorted,_svg,previewEntry,{width: _args.width, height: _args.height, innerCircleR : _args.innerCircleR});
            
            
            
            

	}
	


	
	
    var sortJson = function(data,sortMethod) {
		var ret;
		console.log('sorting');
		if(sortMethod==SORT_METHOD_TITLE) {
			ret=data.outLinks.sort(function(a,b) { return a.title > b.title ? 1 : -1 });
		}
		else {
			ret=data.outLinks.sort(function(a,b) { return parseFloat(a.relatedness) - parseFloat(b.relatedness) } );
		}
		return ret;
	}

	var previewEntry  =function(item,index,theta) {
	    
	    console.log('preview');
	    
	    //var r = 65;
	    
	    //var x = width/2-(_args.innerCircleR+item.relatedness*_args.barMaxSize+r)*Math.cos(theta*index);
	   // var y = height/2+(_args.innerCircleR+item.relatedness*_args.barMaxSize+r)*Math.sin(theta*index);
	    
	    var url = URL_BY_ID_JSON+item.id;
	    
	    $('#small-loading').fadeIn();
	//	spinner2.spin($('#small-loading'));
	    
        $.getJSON(url, function(data) {
            
              $('#small-loading').fadeOut();
           	 // spinner2.stop();

           
           //console.log(data);
            
           var newsorted = sortJson(data,SORT_METHOD_TITLE); 
           newsorted = relCutoff(newsorted,0.5);
           
           //console.log(newsorted);
           var small_width = 500;
           var small_height = 500;
           
           
           drawPreviewCategories(data);

  	      new SunDrawer(data.title,newsorted,_smallsvg,null,{width: small_width, height: small_height, innerCircleR : 50, barMaxSize: 50, showText: 'false'});

// 	      new SunDrawer(sorted,_smallsvg,previewEntry,{width: 200, height: 200, innerCircleR : 50,barMaxSize: 50});
  	      

           $(_preview_container).html('<p>'+data.definition+'</p>');
  	      $(_preview_container).css('top',_args.height/2+120);
  	      $(_preview_container).css('left',_args.width-28);
  	      $(_preview_container).show();
  	      
  	      $('.small-svg').show();

  	      
  	      $(_preview_container).unbind('click');

           $(_preview_container).click(function(d,index) {
                $(_preview_container).hide();
  	             $('.small-svg').animate({
                    left: '140',
                  }, 300, function() {


                     _cat_g.selectAll(".cat").remove();
            	     _cat_g.selectAll(".main_curve").remove();
                    _the_svg.selectAll('.connect-g').remove();

                     createVis(data);
                     _wikidata_cache = data;
                     
                     nav_history.push(data);
                     

                     
                     $('#article').val(data.title)
                     $('#article-id').val(data.id)
                     $('.small-svg').fadeOut(100);
                     
                     console.log(nav_history);
                       
                    

                  });
	        });

/*
           $(_preview_container).html('<p>'+data.definition+'</p>');
           $(_preview_container).css('top',y-40);
           $(_preview_container).css('left',x-50);
           $(_preview_container).show();
           $(_preview_container).click(function(d,index) {
                $(_preview_container).hide();
        	    _svg.selectAll('circle').remove();
	            openEntry(item.id);
	        });
    */       
        });

	    
	    
	   

	}
	
	
	initialize();

};

	Wikistalker.prototype.changeRelevanceCutoff = function(cutoff) {
	    _args.relevance_cutoff=cutoff;
	    this.createVis();
	}

	Wikistalker.prototype.changeArticle = function(id,title) {

	    this.openEntry(id,title);
	}

	Wikistalker.prototype.changeSortMethod = function(method) {

	    _args.sortMethod=method;
	    this.createVis();
	}
	
	Wikistalker.prototype.makeHistory = function() {
	
	    this.drawHistory();

	    
	}
	
	
	
	
	


