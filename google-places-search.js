import './google-places-search.css';
import '../../shared/custom-module.css';

var markers = [];

function initCustomElement () {
  try {
    CustomElement.init((element, _context) => {
      CustomElement.setHeight(460);

      // Setup with initial value and disabled state
      var initialValue = JSON.parse(element.value)
      initGooglePlacesAutocomplete(element.config, initialValue);

      setDisabledState(element.disabled);

      CustomElement.onDisabledChanged((disabled) => {
        setDisabledState(disabled)
      });
    });

    // React on disabled changed (e.g. when publishing the item)
    //CustomElement.onDisabledChanged(updateDisabled);
  }
  catch (err) {
    // Initialization with Kentico Custom element API failed (page displayed outside of the Kentico UI)
    console.error(err);
    //initializeEditor(err.toString());
    CustomElement.setHeight(400);
    initGooglePlacesAutocomplete(element.config);
  }
}

function initGooglePlacesAutocomplete(config, initialValue) {

  var script = document.createElement('script');
  script.onload = function () {
    // map
    var map = new google.maps.Map(
      document.getElementById('map'),
      {
        zoom: 4,
        center: config.center,
        disableDefaultUI: true,
        gestureHandling: "none",
        zoomControl: true,
        clickableIcons: false,
        draggableCursor: 'initial'
      }
    );

    // search
    var placesSearchElement = document.getElementById('places-search');
    var placesSearch = new google.maps.places.Autocomplete(placesSearchElement);
    placesSearch.addListener('place_changed', () => {
      var place = placesSearch.getPlace();
      if(placesSearchElement.value && place && place.geometry) {
        var chosenPlace = {
          name: place.formatted_address,
          position: place.geometry.location
        }

        changePosition(map, chosenPlace)
        CustomElement.setValue(JSON.stringify(chosenPlace))
      } else {
        changePosition(map, { name: null, position: config.center }, true)
        CustomElement.setValue(null)
      }
    })

    // Set initial values
    if(initialValue) {
      placesSearchElement.value = initialValue.name;
      changePosition(map, initialValue);
    }

    document.getElementById("clear-button").addEventListener('click', function() {
      placesSearchElement.value = "";
      google.maps.event.trigger(placesSearch, 'place_changed');
    })
  };
  script.src = "https://maps.googleapis.com/maps/api/js?key="+ config.googleApiKey +"&libraries=places";
  document.body.appendChild(script);
}

function changePosition(map, chosenPlace, isDefault) {
  map.setCenter(chosenPlace.position);
  map.setZoom(isDefault ? 4 : 15)
  if(markers.length > 0)
  {
    markers[0].setMap(null);
    markers = [];
  }

  if(!isDefault) {
    var marker = new google.maps.Marker({
      map: map,
      title: chosenPlace.name,
      position: chosenPlace.position
    });
    markers.push(marker);
  }
}

function setDisabledState(disabled) {
  document.getElementById("places-search").disabled = disabled;
  document.getElementById("clear-button").disabled = disabled;
}

initCustomElement();