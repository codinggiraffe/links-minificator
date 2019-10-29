import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../auth.service';

interface LongShortLink {
  from: string;
  to: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  title = 'links-minificator';
  longLink = '';
  resultArr: LongShortLink[] = [];
  constructor(private httpClient: HttpClient,
              private auth: AuthService) {
  }
  ngOnInit() {
  }
  shortLink() {
    // console.log('here');
    if (this.auth.isAuthenticated()) {
      this.httpClient.post<{shortLink: string}>('http://localhost:3000/api/tracked_short_url', {long_url: this.longLink})
        .subscribe((res) => {
          console.log(res);
          this.resultArr.unshift({from: this.longLink, to: window.location.href + res.shortLink});
          this.longLink = '';
        });
    } else {
      this.httpClient.post<{shortLink: string}>('http://localhost:3000/api/short_url', {long_url: this.longLink})
        .subscribe((res) => {
          console.log(res);
          this.resultArr.unshift({from: this.longLink, to: window.location.href + res.shortLink});
          this.longLink = '';
        });
    }
  }
}
