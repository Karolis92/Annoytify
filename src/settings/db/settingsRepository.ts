import { UpdateMode } from "realm";
import realm from "../../common/db/realm";
import { ThemePreference } from "../../common/enums/ThemePreference";
import { ISettings, SETTINGS_ID, Settings } from "./models";

class SettingsRepository {
  get(): Settings | null {
    return realm.objectForPrimaryKey(Settings, SETTINGS_ID);
  }

  setThemePreference(themePreference: ThemePreference) {
    const settings: ISettings = { _id: SETTINGS_ID, themePreference };
    realm.write(() => realm.create(Settings, settings, UpdateMode.Modified));
  }
}

export default new SettingsRepository();
