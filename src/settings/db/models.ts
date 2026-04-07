import Realm, { ObjectSchema } from "realm";
import { ThemePreference } from "../../common/enums/ThemePreference";

export const SETTINGS_ID = 1;

export interface ISettings {
  _id: number;
  themePreference: ThemePreference;
}

export class Settings extends Realm.Object<Settings> implements ISettings {
  _id!: number;
  themePreference!: ThemePreference;

  static schema: ObjectSchema = {
    name: "Settings",
    properties: {
      _id: "int",
      themePreference: "string",
    },
    primaryKey: "_id",
  };
}

export const SettingsModels = [Settings];
