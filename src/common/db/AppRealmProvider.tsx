import { RealmProvider } from "@realm/react";
import { PropsWithChildren } from "react";
import { TasksModels } from "../../tasks/db/models";

const AppRealmProvider = ({ children }: PropsWithChildren) => {
  return (
    <RealmProvider schema={[...TasksModels]} deleteRealmIfMigrationNeeded>
      {children}
    </RealmProvider>
  );
};

export default AppRealmProvider;
