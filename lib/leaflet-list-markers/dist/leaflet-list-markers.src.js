/* 
 * Leaflet List Markers v0.0.2 - 2014-06-12 
 * 
 * Copyright 2014 Stefano Cudini 
 * stefano.cudini@gmail.com 
 * http://labs.easyblog.it/ 
 * 
 * Licensed under the MIT license. 
 * 
 * Demo: 
 * http://labs.easyblog.it/maps/leaflet-list-markers/ 
 * 
 * Source: 
 * git@github.com:stefanocudini/leaflet-list-markers.git 
 * 
 */

//add layer group
var tempLayerGroup = L.layerGroup();

function flyToStore(currentFeature) {
              console.log('flytostore called');
              map.flyTo(currentFeature._latlng, 6);
            }

(function() {

L.Control.ListMarkers = L.Control.extend({

	includes: L.Mixin.Events,

	options: {		
		layer: false,
		maxItems: 20,
		collapsed: false,		
		label: 'title',
		itemIcon: '',
		itemArrow: '&#10148;',	//visit: http://character-code.com/arrows-html-codes.php
		maxZoom: 9,
		position: 'bottomleft'
		//TODO autocollapse
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
		this._container = null;
		this._list = null;
		this._layer = this.options.layer || new L.LayerGroup();
	},

	onAdd: function (map) {

		this._map = map;
	
		var container = this._container = L.DomUtil.create('div', 'list-markers');

		this._list = L.DomUtil.create('ul', 'list-markers-ul', container);

		this._initToggle();

		map.on('moveend', this._updateList, this);
			
		this._updateList();

		return container;


	},
	
	onRemove: function(map) {
		map.off('moveend', this._updateList, this);
		this._container = null;
		this._list = null;		
	},

	_createItem: function(layer) {

		console.log('layer in view');
		console.log(layer);


	    var currentFeature = layer.feature.properties.title;

	    var currentID = layer._leaflet_id;

	    tempLayerGroup.addLayer(layer);


	    //console.log(currentID);

	    //console.log('active layer2: ');
	    //console.log(activeLayer);

/*
	    var region = document.getElementById('region');
	    var region = region.appendChild(document.createElement('div'));
	    region.className = 'region-class';
	    region.innerHTML = activeLayer;
*/

	    var popupContent = '<img src="'+layer.feature.properties.thumbnail_300+'" width="150" height="150" style="border:1px solid #021a40;">'+'<h4 class="sidebar-link" id="sidebar-link"></br>'+layer.feature.properties.title+'</h4>Date Published: '+layer.feature.properties.date_published;


		if (layer.feature.properties.region_id == activeLayer) {

		    var productListings = document.getElementById('product-listings');
		    var productListings = productListings.appendChild(document.createElement('div'));
		    productListings.className = 'item';
		    productListings.id = 'listing-' + currentID;

		    // Create a new link with the class 'title' for each store
		    // and fill it with the store address
		    var link = productListings.appendChild(document.createElement('a'));
		    link.href = '#';
		    link.className = 'title';
		    link.dataPosition = currentID;
		    link.innerHTML = popupContent;
	    


	    link.addEventListener('click', function(e){
	        // Update the currentFeature to the store associated with the clicked link
	        var clickedListing = tempLayerGroup.getLayer(this.dataPosition);

	        console.log('data position');
	        console.log(this.dataPosition);

	        console.log('display clickedListing');
	        console.log(clickedListing);
	        
	        // 1. Fly to the point
	        flyToStore(clickedListing);

	        // 2. Close all other popups and display popup for clicked store
	        //createPopUp(clickedListing);
	        
	        // 3. Highlight listing in sidebar (and remove highlight for all other listings)
	        var activeItem = document.getElementsByClassName('active');

	        if (activeItem[0]) {
	           activeItem[0].classList.remove('active');
	        }
	        this.parentNode.classList.add('active');
		});

	    }

		var li = L.DomUtil.create('li', 'list-markers-li'),
			a = L.DomUtil.create('a', '', li),
			icon = this.options.itemIcon ? '<img src="'+this.options.itemIcon+'" />' : '',
			that = this;

		a.href = '#';
		L.DomEvent
			.disableClickPropagation(a)
			.on(a, 'click', L.DomEvent.stop, this)
			.on(a, 'click', function(e) {
				this._moveTo( layer.getLatLng() );
			}, this)
			.on(a, 'mouseover', function(e) {
				that.fire('item-mouseover', {layer: layer });
			}, this)
			.on(a, 'mouseout', function(e) {
				that.fire('item-mouseout', {layer: layer });
			}, this);			

			
		
		//console.log('_createItem',layer.options);

		if( layer.options.hasOwnProperty(this.options.label) )
		{
			a.innerHTML = icon+'<span>'+layer.options[this.options.label]+'</span> <b>'+this.options.itemArrow+'</b>';
			//TODO use related marker icon!
			//TODO use template for item
		}
		else
			console.log("propertyName '"+this.options.label+"' not found in marker");

		return li;
	},

	_updateList: function() {
	
		$( '.product-listings').empty();

		var that = this,
			n = 0;


		this._list.innerHTML = '';
		this._layer.eachLayer(function(layer) {
			if(layer instanceof L.Marker)
				if( that._map.getBounds().contains(layer.getLatLng()) )
					if(++n < that.options.maxItems)
						that._list.appendChild( that._createItem(layer) );
		});

	},

	_initToggle: function () {

		/* inspired by L.Control.Layers */

		var container = this._container;

		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent
				.disableClickPropagation(container);
				//.disableScrollPropagation(container);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		if (this.options.collapsed)
		{
			this._collapse();

			if (!L.Browser.android) {
				L.DomEvent
					.on(container, 'mouseover', this._expand, this)
					.on(container, 'mouseout', this._collapse, this);
			}
			var link = this._button = L.DomUtil.create('a', 'list-markers-toggle', container);
			link.href = '#';
			link.title = 'List Markers';

			if (L.Browser.touch) {
				L.DomEvent
					.on(link, 'click', L.DomEvent.stop)
					.on(link, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		}
	},

	_expand: function () {
		this._container.className = this._container.className.replace(' list-markers-collapsed', '');
	},

	_collapse: function () {
		L.DomUtil.addClass(this._container, 'list-markers-collapsed');
	},

    _moveTo: function(latlng) {
		if(this.options.maxZoom)
			this._map.setView(latlng, Math.min(this._map.getZoom(), this.options.maxZoom) );
		else
			this._map.panTo(latlng);    
    }
});

L.control.listMarkers = function (options) {
    return new L.Control.ListMarkers(options);
};

L.Map.addInitHook(function () {
    if (this.options.listMarkersControl) {
        this.listMarkersControl = L.control.listMarkers(this.options.listMarkersControl);
        this.addControl(this.listMarkersControl);
    }
});

}).call(this);