import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormService } from '../form.service';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { GlobalService } from '../../../global.service';
import { FormErrorMessages } from '../../../util/constants';
import { MetaService } from '../../../common/meta/meta.service';

@Component({
  selector: 'app-contact-index',
  templateUrl: './contact-index.component.html',
  styleUrls: ['./contact-index.component.scss']
})
export class ContactIndexComponent implements OnInit {
  pageDescription = 'Noticed a bug? Got an idea for a feature? Want to collaborate? Or just want to say hello? I\'d love to hear from you. Send me a message!';
  pageTitle = 'Share the love. Submit your feedback on the Fretonator - the ultimate interactive free guitar theory tool.';
  pageUrl = 'https://www.fretonator.com/contact';
  formName = 'Contact';
  formSubmitError = false;
  globalErrors = {
    name: false,
    email: false,
    message: false,
    any: false
  };
  form = new FormGroup({
    honeypot: new FormControl('', [
      Validators.maxLength(0)
    ]),
    name: new FormControl('', [
      Validators.required,
      Validators.maxLength(81),
      Validators.pattern(/[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)/)
    ]),
    email: new FormControl('', [
      Validators.email
    ]),
    message: new FormControl('', [
      Validators.required,
      Validators.minLength(30)
    ]),
    submit: new FormControl('Submit', [])
  }, {
    updateOn: 'change'
  });

  constructor(private formService: FormService,
              private router: Router,
              private globalService: GlobalService,
              private metaService: MetaService) {
  }

  ngOnInit(): void {
    this.metaService.updateAllGenericMeta(this.pageUrl, this.pageTitle, this.pageDescription);
  }

  onSubmit() {
    this.resetGlobalErrors();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.calculateGlobalErrors();
      return;
    }

    this.formSubmitError = false;
    this.submit.disable();

    const form = {
      Name: this.name.value,
      Email: this.email.value,
      Message: this.message.value,
      'form-name': this.formName,
      'bot-field': this.honeypot.value
    };

    this.formService.submit('/contact/success', form)
      .pipe(tap(() => this.submit.enable()))
      .subscribe(
        () => this.onSuccess(),
        (err) => this.onFail());
  }

  async onSuccess() {
    await (this.router.navigate(['/', 'contact', 'success'], { state: { scrollToTop: true } }));
  }

  onFail() {
    this.formSubmitError = true;
  }

  get name() {
    return this.form.get('name');
  }

  get email() {
    return this.form.get('email');
  }

  get message() {
    return this.form.get('message');
  }

  get submit() {
    return this.form.get('submit');
  }

  get honeypot() {
    return this.form.get('honeypot');
  }

  resetGlobalErrors() {
    this.globalErrors = {
      name: false,
      email: false,
      message: false,
      any: false
    };
  }

  getNameError() {
    if (!this.name.errors) {
      return;
    }
    return true;
  }

  getEmailError() {
    if (!this.email.errors) {
      return;
    }
    return true;
  }

  getMessageError() {
    if (!this.message.errors) {
      return;
    }
    return true;
  }

  calculateGlobalErrors() {
    this.globalErrors = {
      name: this.getNameError(),
      email: this.getEmailError(),
      message: this.getMessageError(),
      any: this.getNameError() || this.getEmailError() || this.getMessageError()
    };
  }

  getErrorMessage(field: string, type: string) {
    return FormErrorMessages[field][type];
  }

}
