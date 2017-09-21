import React from 'react';
import { compose, withProps, lifecycle } from "recompose";
import { withScriptjs, withGoogleMap, GoogleMap, Marker, DirectionsRenderer } from "react-google-maps";
import SearchBox from "react-google-maps/lib/components/places/SearchBox";
import $ from 'jquery';


const MapWithADirectionsRenderer = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
    directions: 'walking'
  }),
  withScriptjs,
  withGoogleMap,
  lifecycle({
    componentWillReceiveProps() {
      let endLat = this.props.endAddress[0];
      let endLong = this.props.endAddress[1];
      const DirectionsService = new google.maps.DirectionsService();
      DirectionsService.route({
        origin: new google.maps.LatLng(this.state.startLat, this.state.startLong),
        destination: new google.maps.LatLng(endLat, endLong),
        travelMode: google.maps.TravelMode.WALKING,
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.setState({
            directions: result,
          });
        } else {
          console.error(`error fetching directions ${result}`);
        }
      });
    },
    componentWillMount() {
      const refs = {}

      this.setState({
        bounds: null,
        center: {
          lat: 40.75057, lng: -73.97641
        },
        markers: [],
        onMapMounted: ref => {
          refs.map = ref;
        },
        onBoundsChanged: () => {
          this.setState({
            bounds: refs.map.getBounds(),
            center: refs.map.getCenter(),
          })
        },
        onSearchBoxMounted: ref => {
          refs.searchBox = ref;
        },

        onPlacesChanged: () => {

          const places = refs.searchBox.getPlaces();
          console.log(places);
          const bounds = new google.maps.LatLngBounds();
          places.forEach(place => {
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport)
            } else {
              bounds.extend(place.geometry.location)
            }
          });
          const nextMarkers = places.map(place => ({
            position: place.geometry.location,
          }));
          const nextCenter = _.get(nextMarkers, '0.position', this.state.center);

          this.setState({
            center: nextCenter,
            markers: nextMarkers,
          });
          // refs.map.fitBounds(bounds);
          let startLong = (places[0].geometry.viewport.b.b + places[0].geometry.viewport.b.f)/2;
          let startLat = (places[0].geometry.viewport.f.b + places[0].geometry.viewport.f.f)/2;
          this.setState({
            startLat: startLat,
            startLong: startLong
          })
          let endLat = this.props.endAddress[0];
          let endLong = this.props.endAddress[1];
          const DirectionsService = new google.maps.DirectionsService();
          DirectionsService.route({
            origin: new google.maps.LatLng(startLat, startLong),
            destination: new google.maps.LatLng(endLat, endLong),
            travelMode: google.maps.TravelMode.WALKING,
          }, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              this.setState({
                directions: result,
              });
            } else {
              console.error(`error fetching directions ${result}`);
            }
          });
        },
      })
    }
  })
)(function(props) {
  return (
  <GoogleMap
    defaultZoom={14}
    defaultCenter={new google.maps.LatLng(40.75057, -73.97641)}
  >
    <SearchBox
      ref={props.onSearchBoxMounted}
      bounds={props.bounds}
      controlPosition={google.maps.ControlPosition.TOP_LEFT}
      onPlacesChanged={props.onPlacesChanged}
    >
      <input
        type="text"
        placeholder="Starting point:"
        style={{
          boxSizing: `border-box`,
          border: `1px solid transparent`,
          width: `240px`,
          height: `32px`,
          marginTop: `27px`,
          padding: `0 12px`,
          borderRadius: `3px`,
          boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
          fontSize: `14px`,
          outline: `none`,
          textOverflow: `ellipses`,
        }}
      />
    </SearchBox>
    {props.directions && <DirectionsRenderer directions={props.directions} />}
    {props.markers.map((marker, index) =>
      <Marker key={index} position={marker.position} />
    )}
  </GoogleMap>
  )
});
//not full magic mode - look up the new syntax

export default MapWithADirectionsRenderer;
