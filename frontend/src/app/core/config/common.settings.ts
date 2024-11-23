import { environment } from '../../../environments/environment';

export class SETTINGS {
  public static ACCESS_TOKEN = '%&^%^*@&*#';
  public static REFRESH_TOKEN = '&@&#&$(@&##';
  public static USER_PRIVILEGES = '%$^%((*';
  public static USER_PERMISSIONS = ')(&^&%^$*&*&$&*()*';
  public static USER_ROLE = ')(&^&%^$*&**&^%^&&^&&$&*()*';
  public static LOGGED_IN_USER = '#$%@^^%';

  // public static BASE_API = '';
  public static BASE_API = environment.baseUrl; // do not change this

  public static KEYS = {
    SECRET: 'iIUsWtNZcf',
  };

  public static REGEX = {
    PASSWORD: {
      EXP: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$',
    },
    PHONE: {
      EXP: '^[0-9]{1,10}$',
    },
    ID: {
      EXP: '^[0-9]{9}v$',
    },
    LETTERS: {
      EXP: '[a-zA-Z\\s]*$',
    },
  };
}
