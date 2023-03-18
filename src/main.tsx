import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Repo, DocumentId } from "automerge-repo";
import { BroadcastChannelNetworkAdapter } from "automerge-repo-network-broadcastchannel";
import { LocalForageStorageAdapter } from "automerge-repo-storage-localforage";
import { RepoContext } from "automerge-repo-react-hooks";
import { State, ROOT_ID_KEY, Params, urlDateFormat } from "./types";
import dayjs from "dayjs";
import { createParams } from "./util";

const repo = new Repo({
  network: [new BroadcastChannelNetworkAdapter()],
  storage: new LocalForageStorageAdapter(),
});

const getRootId = () => {
  const rootDocId = localStorage[ROOT_ID_KEY];
  if (rootDocId) return rootDocId as DocumentId;

  // create an empty document
  const handle = repo.create<State>();

  localStorage[ROOT_ID_KEY] = handle.documentId;
  return handle.documentId;
};

const rootDocId = getRootId();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <RepoContext.Provider value={repo}>
    <React.StrictMode>
      <App rootId={rootDocId} params={createParams()} />
    </React.StrictMode>
  </RepoContext.Provider>
);
