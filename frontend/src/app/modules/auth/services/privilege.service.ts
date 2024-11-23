import { Injectable } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { SETTINGS } from '../../../core/config/common.settings';
import * as _ from 'lodash';
import {EncryptionService} from "../../../core/services/encryption.service";

@Injectable({
  providedIn: 'root',
})
export class PrivilegeService {
  @LocalStorage(SETTINGS.USER_PRIVILEGES)
  private userPrivilegesEncStr: any;

  private userPrivileges: Array<string> = [];

  constructor(private encryptionService: EncryptionService) {
    if (!_.isEmpty(this.userPrivilegesEncStr)) {
      this.decryptPrivileges();
    }
  }

  setUserPrivileges(userPrivileges: Array<string>): void {
    this.userPrivilegesEncStr = this.encryptionService.encrypt(
      JSON.stringify(userPrivileges),
    );
    this.decryptPrivileges();
  }

  initPrivilegeCodes(): any {
    if (!_.isEmpty(this.userPrivilegesEncStr)) {
      this.decryptPrivileges();
    }
  }

  hasPrivilege(privilegeCode: string): boolean {
    return _.includes(this.userPrivileges, privilegeCode);
  }

  hasAnyPrivilege(privilegeCodes: Array<string>): boolean {
    if (privilegeCodes.length === 1) {
      if (privilegeCodes[0] === '') {
        return true;
      }
    }

    let hasAnyPrivilege = false;

    privilegeCodes.forEach((privilegeCode) => {
      if (this.hasPrivilege(privilegeCode)) {
        hasAnyPrivilege = true;
        return;
      }
    });

    return hasAnyPrivilege;
  }

  private decryptPrivileges(): void {
    this.userPrivileges = JSON.parse(
      this.encryptionService.decrypt(this.userPrivilegesEncStr),
    );
  }
}
