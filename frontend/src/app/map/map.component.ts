import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { webSocket } from 'rxjs/webSocket';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit {
  subject = webSocket('ws://localhost:8080/write');

  private map!: L.Map;
  private polygon!: L.Polygon;
  private markers: L.Marker[] = [];
  private areaCoordinates: [number, number][] = [
    [52.48377799329501, 13.386226256445926],
    [52.47108074317074, 13.386184562822534],
    [52.4656197989678, 13.401736284563809],
    [52.46716925195662, 13.416203971881272],
    [52.4698362154261, 13.416162278257879],
    [52.47080136238159, 13.420331640597206],
    [52.478115472309106, 13.417746635946825],
    [52.47913122476407, 13.413535579984103],
    [52.478521776105055, 13.411492592437835],
    [52.4836510389591, 13.398734343262085],
  ];

  private areaOptions = {
    color: 'blue', // Border color
    fillOpacity: 0, // Fill opacity set to 0
  };

  private circles: L.Circle[] = [];

  constructor() {}

  ngOnInit(): void {
    this.initMap();
    this.createPolygon();
    this.createCircles();
    this.startMoving();

    this.subject.subscribe();

    // this.subject.next({ user: 'Julian', xCoordinate: 37, yCoordinate: 42 });
  }

  icon = L.icon({
    iconUrl: 'assets/marker.png',
    iconSize: [41, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
  });

  initMap(): void {
    this.map = L.map('map').setView(
      [52.47397365581503, 13.404288402693037],
      15
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
  }

  createPolygon(): void {
    this.polygon = L.polygon(this.areaCoordinates, this.areaOptions).addTo(
      this.map
    );
  }

  allMarkers: any[] = []; // Array to store all markers

  createCircles(): void {
    const dotIcon = L.divIcon({
      className: 'dot-marker',
    });

    const circleData = [
      { center: [52.47732570170031, 13.394090162843977], radius: 540 },
      { center: [52.473697380130105, 13.401374194968042], radius: 760 },
      { center: [52.47265540286542, 13.40938174507275], radius: 550 },
      { center: [52.48209591820308, 13.388518872891433], radius: 150 },
    ];

    let user = 0;

    circleData.forEach((data, index) => {
      const centerLatLng: L.LatLngTuple = data.center as L.LatLngTuple;
      const circle = L.circle(centerLatLng, {
        color: 'transparent',
        fillColor: 'transparent',
        fillOpacity: 0,
        radius: data.radius,
      }).addTo(this.map);

      for (let i = 0; i < 100; i++) {
        console.log(1);

        const randomLatLng = this.generateRandomLatLng(
          [data.center[0], data.center[1]],
          data.radius
        );
        const marker = L.marker(randomLatLng, { icon: this.icon }).addTo(
          this.map
        );

        user++;

        //TODO Push to Database
        this.allMarkers.push({
          markerId: user,
          marker: marker,
          circle: circle,
        });

        console.log(`Updating user ${user}`);

        const message = {
          user: user,
          xCoordinate: marker.getLatLng().lat,
          yCoordinate: marker.getLatLng().lng,
        };

        this.subject.next(message);
      }

      //this.circles.push(circle);
    });
  }

  generateRandomLatLng(center: [number, number], radius: number): L.LatLng {
    // Convert radius from meters to degrees
    const radiusInDegrees = radius / 111300;

    // Generate random angle in radians
    const randomAngle = Math.random() * Math.PI * 2;

    // Generate random radius (0 to radiusInDegrees)
    const randomRadius = Math.random() * radiusInDegrees;

    // Calculate new latitude and longitude
    const newLat = center[0] + randomRadius * Math.cos(randomAngle);
    const newLng = center[1] + randomRadius * Math.sin(randomAngle);

    return L.latLng(newLat, newLng);
  }

  startMoving(): void {
    setInterval(() => {
      // Shuffle the array of markers
      this.shuffleArray(this.allMarkers);

      // Calculate the number of markers to move (20% of total markers)
      const markersToMove = Math.ceil(0.2 * this.allMarkers.length);

      // Iterate over the first 20% of markers and move them
      for (let i = 0; i < markersToMove; i++) {
        const markerData = this.allMarkers[i];
        const marker = markerData.marker;
        const circle = markerData.circle;
        const user = markerData.markerId;

        // Get a random position within the circle bounds
        const newPosition = this.getRandomPositionWithinCircle(circle, marker);

        // Set the new position for the marker
        marker.setLatLng(newPosition);

        const message = {
          user: user,
          xCoordinate: marker.getLatLng().lat,
          yCoordinate: marker.getLatLng().lng,
        };

        this.subject.next(message);
      }
    }, 10000); // Adjust the interval as needed
  }

  shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  getRandomPositionWithinCircle(circle: L.Circle, marker: L.Marker): L.LatLng {
    // Define the range for latitude and longitude adjustments
    const range = 0.0001349; // Adjust this value as needed

    // Generate random adjustments for latitude and longitude
    const latAdjustment = (Math.random() - 0.5) * range * 2;
    const lngAdjustment = (Math.random() - 0.5) * range * 2;

    // Get the marker's old position
    const oldPosition = marker.getLatLng();

    // Calculate the latitude and longitude of the new position by adding random adjustments to the old position
    const newLat = oldPosition.lat + latAdjustment;
    const newLng = oldPosition.lng + lngAdjustment;

    // Create a LatLng object for the new position
    let newPosition = L.latLng(newLat, newLng);

    // Check if the new position is within the circle's bounds
    if (circle.getBounds().contains(newPosition)) {
      // Check if the new position overlaps with any other circle
      for (const otherCircle of this.circles) {
        if (
          circle !== otherCircle &&
          otherCircle.getBounds().contains(newPosition)
        ) {
          // Move the marker to the next circle if overlap occurs
          const nextCircle = this.findNextCircle(circle);
          newPosition = nextCircle.getLatLng();
          break;
        }
      }
      // Return the new position if it's within bounds or moved to the next circle
      return newPosition;
    } else {
      // Return the old position if the new position is outside the circle's bounds
      return oldPosition;
    }
  }

  findNextCircle(circle: L.Circle): L.Circle {
    // Find the index of the current circle in the circles array
    const currentIndex = this.circles.indexOf(circle);

    // Move to the next circle in the array (or wrap around to the beginning if at the end)
    const nextIndex = (currentIndex + 1) % this.circles.length;

    return this.circles[nextIndex];
  }
}
