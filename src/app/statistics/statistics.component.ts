import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';

interface LinkStatistics {
  link: string;
  shortLink: string;
  clickCounter: number;
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  statisticsArr: LinkStatistics[] = [];
  originUrl = window.location.origin;

  constructor(private httpClient: HttpClient,
              private auth: AuthService,
              private router: Router) { }

  ngOnInit() {
    this.httpClient.post<{links}>('http://localhost:3000/statistics', {})
      .subscribe(resp => {
        this.statisticsArr.push(...resp.links);
      });
  }

}
