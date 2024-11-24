import { FormGroup } from '@angular/forms';

export class AppUtils {
  public static getFormErrors(theForm: FormGroup, formErrors: any): [] {
    for (const field in formErrors) {
      if (!Object.prototype.hasOwnProperty.call(formErrors, field)) {
        continue;
      }

      // Clear previous errors
      formErrors[field] = {};

      // Get the control
      const control = theForm?.get(field);

      if (control && control.dirty && !control.valid) {
        formErrors[field] = control.errors;
      }
    }

    return formErrors;
  }
}
