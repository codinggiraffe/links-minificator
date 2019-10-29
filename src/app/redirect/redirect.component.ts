import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.scss']
})
export class RedirectComponent implements OnInit {

  constructor(private httpClient: HttpClient,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.httpClient.post<{'link': string | undefined}>('http://localhost:3000/api/redirect',
      {short_url: this.route.snapshot.paramMap.get('short_link')})
      .subscribe((res) => {
        if (res.link) {
          console.log(res.link);
          window.location.href = res.link;
        } else {
          console.log('Not find');
        }
      });
  }

}
