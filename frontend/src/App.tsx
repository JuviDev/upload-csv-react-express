import React, { useState } from "react";
import { Toaster, toast } from "sonner";
import "./App.css";
import { uploadFile } from "./services/upload";
import { type Data } from "./types";
import { Search } from "./steps/Search";

const APP_STATUS = {
  IDLE: "idle",
  READY_UPLOAD: "ready_upload",
  UPLOADING: "uploading",
  READY_USEGE: "ready_usage",
  ERROR: "error",
} as const;

const BUTTON_TEXT = {
  [APP_STATUS.READY_UPLOAD]: "Subir Archivo",
  [APP_STATUS.UPLOADING]: "Subiendo...",
};

type AppStatusType = (typeof APP_STATUS)[keyof typeof APP_STATUS];

function App() {
  const [appStatus, setAppStatus] = useState<AppStatusType>(APP_STATUS.IDLE);
  const [data, setData] = useState<Data>([]);
  const [file, setFile] = useState<File | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];

    if (file) {
      setFile(file);
      setAppStatus(APP_STATUS.READY_UPLOAD);
    }

    console.log(file);
  };

  const handleSumit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (appStatus !== APP_STATUS.READY_UPLOAD || !file) {
      return;
    }

    setAppStatus(APP_STATUS.UPLOADING);

    const [err, newData] = await uploadFile(file);

    if (err) {
      setAppStatus(APP_STATUS.ERROR);
      toast.error(err.message);
      return;
    }

    setAppStatus(APP_STATUS.READY_USEGE);
    if (newData) setData(newData);
    toast.success("Archivo subido correctamente");

    console.log(newData);
  };

  const showButton =
    appStatus === APP_STATUS.READY_UPLOAD || appStatus === APP_STATUS.UPLOADING;
  const showInput = appStatus !== APP_STATUS.READY_USEGE;

  return (
    <>
      <Toaster />
      <h4>Upload CSV + Search</h4>
      {showInput && (
        <form onSubmit={handleSumit}>
          <label>
            <input
              onChange={handleInputChange}
              disabled={appStatus === APP_STATUS.UPLOADING}
              name="file"
              type="file"
              accept=".csv"
            />
          </label>

          {showButton && (
            <button disabled={appStatus === APP_STATUS.UPLOADING}>
              {BUTTON_TEXT[appStatus]}
            </button>
          )}
        </form>
      )}
      {appStatus === APP_STATUS.READY_USEGE && <Search initialData={data} />}
    </>
  );
}

export default App;
