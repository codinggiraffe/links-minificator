import { Component, OnInit } from '@angular/core';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  inputLogin: string;
  inputPass: string;
  constructor(private auth: AuthService) { }

  ngOnInit() {
  }

  signUp() {
    this.auth.signup(this.inputLogin, this.inputPass);
  }
}
