import React from "react";
import GoogleMapReact from "google-map-react";

const AnyReactComponent = ({ text }) => <div>{text}</div>;

export default function GoogleMap({ lat, lng, title }) {
  const defaultProps = {
    center: {
      lat,
      lng,
    },
    zoom: 13,
  };

  return (
    // Important! Always set the container height explicitly
    <div style={{ height: "100%", width: "100%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyDV829627m-YZL3znn-m1_KuF-Rtt3dNJg" }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
      >
        <AnyReactComponent lat={lat} lng={lng} text={title} />
      </GoogleMapReact>
    </div>
  );
}
