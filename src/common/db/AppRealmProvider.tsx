import { RealmProvider } from "@realm/react";
import { PropsWithChildren } from "react";
import { TasksModels } from "../../tasks/db/models";
import realmCfg from "./realmCfg";

const AppRealmProvider = ({ children }: PropsWithChildren) => {
  return (
    <RealmProvider {...realmCfg} closeOnUnmount={false}>
      {children}
    </RealmProvider>
  );
};

export default AppRealmProvider;
