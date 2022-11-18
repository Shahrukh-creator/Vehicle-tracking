import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'vehicle-tracking-project';
  vehiclesInformation: any[] = [];
  vehInfo: any[] = [];
  hoveredInfoWindow: any = null;
  //   vehicleIds = [
  //     '110000000100',
  //     '027028253177',
  //     '887028253177',
  //     '127028253177',
  //     '327028253177',
  //   ];

  vehicleId1 = '110000000100';
  vehicleId2 = '027028253177';
  vehicleId3 = '887028253177';
  vehicleId4 = '127028253177';
  vehicleId5 = '327028253177';
  colors = ['red', 'green', 'black', 'blue', 'pink', 'grey', 'purple'];

  vehicleIds: any;
  ts = '';
  vehiclesStartingPoints: [
    {
      deviceId: string;
      latitude: number;
      longitude: number;
      speedOverGround: string;
      coordinateNo: number;
    }
  ] = [
    {
      deviceId: '',
      latitude: 0,
      longitude: 0,
      speedOverGround: '',
      coordinateNo: 0,
    },
  ];
  vehiclesEndingPoints: [
    {
      deviceId: string;
      latitude: number;
      longitude: number;
      speedOverGround: string;
      coordinateNo: number;
      ts: string;
    }
  ] = [
    {
      deviceId: '',
      latitude: 0,
      longitude: 0,
      speedOverGround: '',
      coordinateNo: 0,
      ts: '',
    },
  ];

  sourcePoint: {
    vehicleId: string;
    deviceId: string;
    lat: number;
    lng: number;
  } = {
    vehicleId: '',
    deviceId: '',
    lat: 0,
    lng: 0,
  };

  destinationPoint: {
    vehicleId: string;
    deviceId: string;
    lat: number;
    lng: number;
  } = {
    vehicleId: '',
    deviceId: '',
    lat: 0,
    lng: 0,
  };

  renderOptions = {
    suppressMarkers: true,
  };

  markerOptions = {
    origin: {
      icon: this.getMarker1(0),
      infoWindow: '',
    },
    destination: {
      icon: this.getMarker2(0),
      infoWindow: '',
    },
  };

  constructor(private httpClient: HttpClient, private route: ActivatedRoute) {}

  async getResponse(ts: string): Promise<any> {
    console.log('timestamp', ts);
    return await this.httpClient
      .get('http://localhost:3000/data?ids=' + this.vehicleIds + '&ts=' + ts)
      .toPromise()
      .catch();
  }

  async getMarkersResponse(): Promise<any> {
    return await this.httpClient
      .get('http://localhost:3000/markersData?ids=' + this.vehicleIds)
      .toPromise()
      .catch();
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.vehicleIds = params['ids'] ? params['ids'].toString() : '';
      this.ts = params['ids'] ? params['ts'].toString() : '';
      console.log('idssss', this.vehicleIds);
      console.log('tsssss', this.ts);
      this.sourcePoint = {
        vehicleId: '',
        deviceId: '',
        lat: 0,
        lng: 0,
      };
      this.destinationPoint = {
        vehicleId: '',
        deviceId: '',
        lat: 0,
        lng: 0,
      };

      const response = await this.getMarkersResponse();
      console.log('response start');
      console.log(response);
      console.log('response end');

      if (response.length > 0) {
        this.sourcePoint = {
          vehicleId: '',
          deviceId: response[0].id,
          lat: this.getLatitudeLongitude(response[0].values[0].latitude),
          lng: this.getLatitudeLongitude(response[0].values[0].longitude),
        };
        this.destinationPoint = {
          vehicleId: '',
          deviceId: response[0].id,
          lat: this.getLatitudeLongitude(response[0].values[1].latitude),
          lng: this.getLatitudeLongitude(response[0].values[1].longitude),
        };

        this.markerOptions.origin.infoWindow =
          '<div><p>Latitude: ' +
          this.sourcePoint.lat +
          '</p><p>Longitude: ' +
          this.sourcePoint.lng +
          '</p></div>';

        this.markerOptions.destination.infoWindow =
          '<div><p>Latitude: ' +
          this.destinationPoint.lat +
          '</p><p>Longitude: ' +
          this.destinationPoint.lng +
          '</p></div>';
      }

      let x = 0;

      setInterval(async () => {
        console.log('calling');
        if (
          this.vehiclesInformation.length === 0 ||
          (this.vehiclesInformation &&
            this.vehiclesInformation[0] &&
            this.vehiclesInformation[0].ts &&
            this.vehiclesEndingPoints[0].ts > this.vehiclesInformation[0].ts)
        ) {
          const currentDate = new Date();
          let hrs = (currentDate.getHours() % 12).toString();
          if (hrs.length === 1) {
            hrs = '0' + hrs.toString();
          }

          let mint = currentDate.getMinutes().toString();
          if (mint.length === 1) {
            mint = '0' + mint;
          }

          let sec = currentDate.getSeconds().toString();
          if (sec.length === 1) {
            sec = '0' + sec;
          }

          const ts = hrs + mint + sec;
          const response = await this.getResponse(ts);
          console.log('responseeeeeeeeeee', response);

          // let y = 0;
          // for (let r of response) {
          //   this.vehiclesInformation[y] = [];
          //   this.vehiclesInformation[y][0] = {
          //     deviceID: r.id,
          //     latitude: this.getLatitudeLongitude(r.values[0].latitude),
          //     longitude: this.getLatitudeLongitude(r.values[0].longitude),
          //     speedOverGround: r.values[0].speed,
          //     ts: r.values[0].ts,
          //     coordinateNo: x + 1,
          //   };
          //   y++;
          // }

          // x++;
        }
      }, 3000);
    });
  }

  getLatitudeLongitude(value: string): number {
    if (value.length === 6) {
      value += '000';
    }
    if (value.length === 7) {
      value += '00';
    }
    if (value.length === 8) {
      value += '0';
    }
    const deg = +value.slice(0, 2);
    const min = +value.slice(2, 4);
    const sec = +[
      value.split('.')[1].slice(0, 2),
      '.',
      value.split('.')[1].slice(2, 4),
    ].join('');
    return deg + min / 60 + sec / 3600;
  }

  getMarker2(x: number): string {
    return `assets/marker2${x + 1}.png`;
  }

  getMarker1(x: number): string {
    return `assets/marker1${x + 1}.png`;
  }
}
