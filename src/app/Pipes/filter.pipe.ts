import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: any, filteredValue: string) {
    if(value.length == 0 || filteredValue === '')
    {
    return value;
    }

    const users = []
    for(const user of value)
    {
      if(user['orderId'] == filteredValue){
        users.push(user);
      }
    }
    return users;

  }

}
