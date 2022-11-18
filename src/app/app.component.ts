import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'vehicle-tracking-project';
  vehicleId1 = '110000000100';
  vehicleId2 = '027028253177';
  vehicleId3 = '887028253177';
  vehicleId4 = '127028253177';
  vehicleId5 = '327028253177';
  vehicleId6 = '1234567891';
  colors = ['red', 'green', 'black', 'blue', 'pink', 'grey', 'purple'];

  @ViewChild('f') form: any;
  // empty array to save the vehicles list fetch form back-end api
  vehiclesList: any[] = [];
  vehiclesList_filtered: any[] = [];
  search_device_Id: string = ''


  vehicleIds: any;
  ts = '';

  constructor(private httpClient: HttpClient, private route: ActivatedRoute,
    private offcanvasService: NgbOffcanvas) {}

    openEnd(content: TemplateRef<any>) {
      this.offcanvasService.open(content, { position: 'end' });

    }
  async getResponse(ts: string): Promise<any> {
    console.log('timestamp', ts);
    return await this.httpClient
      .get(
        'http://localhost:3000/data?ids=' + this.vehicleIds + '&ts=' + this.ts
      )
      .toPromise()
      .catch();
  }

  async getMarkersResponse(): Promise<any> {
    return await this.httpClient
      .get('http://localhost:3000/markersData?ids=' + this.vehicleIds)
      .toPromise()
      .catch();
  }

  ngOnChanges() {
    console.log('vehiclePoint');
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      //   this.vehicleIds = params['ids'] ? params['ids'].toString() : '';
      //   this.ts = params['ids'] ? params['ts'].toString() : '';
      //   console.log('idssss', this.vehicleIds);
      //   console.log('tsssss', this.ts);

      this.vehicleIds =
        '110000000100,027028253177,887028253177,127028253177,327028253177';
      this.ts = params['ts'] ? params['ts'].toString() : '';

      if (this.vehicleIds && this.ts) {
        this.vehiclesList = [];

        const vehiclesListResponse = await this.getMarkersResponse();

        for (let index = 0; index < vehiclesListResponse.length; index++) {
          let vehicle = vehiclesListResponse[index];
          // formated object of one vehicle with all necessary information required
          let tempObj = {
            orderId: vehicle.orderId, // orderId
            deviceId: vehicle.id, // device ID

            vehicleId: vehicle.id, // id
            // source point latlng
            source: {
              lat: this.getLatitudeLongitude(vehicle.values[0].latitude),
              lng: this.getLatitudeLongitude(vehicle.values[0].longitude),
            },
            // destination point latlng
            destination: {
              lat: this.getLatitudeLongitude(vehicle.values[1].latitude),
              lng: this.getLatitudeLongitude(vehicle.values[1].longitude),
            },
            // start end point custom markers
            markerOption: this.getMarkerOptions(index),
            // route color option
            renderOptions: {
              suppressMarkers: true,
              // please remove polylineOptions if you need route color with default blue color
              polylineOptions: {
                strokeColor: this.getColor(index),
              },
            },
            // current location latlng initially it will be empty
            currentLocation: {},
            // vehicle Icon
            icon: this.getVehicleIcon(index),
          };
          // push all vehicles in the vehicles list
          this.vehiclesList.push(tempObj);
        }

        let x = 0;
        setInterval(async () => {
          if (x > 0) {
            let hh = this.ts.slice(0, 2);
            let mm = this.ts.slice(2, 4);
            let ss = this.ts.slice(4, 6);
            let dd = new Date();
            dd.setHours(parseInt(hh));
            dd.setMinutes(parseInt(mm));
            dd.setSeconds(parseInt(ss));

            var secToAdd = 3;
            var currDate = new Date(dd.getTime() + secToAdd * 1000);

            const currentDate = currDate;
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
            this.ts = ts.toString();
            console.log('tsssssssssssssss', this.ts);
          }
          const response = await this.getResponse('');
          console.log('responseeeeeeeeeee', response);

          for (let index = 0; index < response.length; index++) {
            let vehicle = response[index];
            let tempObj = {
              lat: this.getLatitudeLongitude(vehicle.values[0].latitude),
              lng: this.getLatitudeLongitude(vehicle.values[0].longitude),
              speedOverGround: vehicle.values[0].speed,
              coordinateNo: x,
              ts: vehicle.values[0].ts,
            };
            // update the current location of each vehicle every 3 seconds
            this.vehiclesList[index].currentLocation = tempObj;
            console.log("Vehicle List data: ",this.vehiclesList);

          }
          x++;
        }, 3000);
      }
    });
  }

  getColor(i: number) {
    return this.colors[i];
  }

  getLatitudeLongitude(value: string): number {
    return parseFloat(value);
  }

  getVehicleIcon(x: number): string {
    return `assets/3.png`;
    //   let number = Math.floor(Math.random() * 5) + 1;
    // return `assets/${number}.png`;
  }

  getMarker2(x: number): string {
    return `assets/marker2${x + 1}.png`;
  }

  getMarker1(x: number): string {
    return `assets/marker1${x + 1}.png`;
  }

  getMarkerOptions(x: number): any {
    let markerOptions = {
      origin: {
        icon: this.getMarker1(x),
        infoWindow: '',
      },
      destination: {
        icon: this.getMarker2(x),
        infoWindow: '',
      },
    };
    return markerOptions;
  }



  // search
  onSubmit(data: any) {
    console.log("Searched: ", data.value.device_id);

    // const filterById = (obj: any) =>{
    //   if(obj.orderId == data.value.device_id)
    //   {
    //     return true;
    //   }else{
    //     return false;
    //   }
    // }
    // let arraybyId = this.vehiclesList.filter(filterById);
    // if(data.value.device_id)
    // {
    //   this.vehiclesList_filtered = arraybyId;
    //   console.log("Filtered Data: ", this.vehiclesList_filtered);
    //   // this.search_status = true;
    //   // this.form.reset();

    // }



    // if (this.form.valid) {
    //   console.log("Form Submitted!");
    //   console.log(this.form.controls)
    //   // this.form.reset();
    // }
  }
}
