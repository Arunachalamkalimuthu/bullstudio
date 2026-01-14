"use client";

import { Dialog, useDialogStore } from "./store";
import React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type DialogState = {
  open: boolean;
  onClose: () => void;
  zIndex?: number;
  target?: string | HTMLElement;
  focused?: "true";
  onOpenChange?: (open: boolean) => void;
};

const DialogContext = createContext<DialogState>({
  open: false,
  onClose: () => undefined,
});

export const useDialogContext = () => useContext(DialogContext);

const DialogProviderInner = ({
  dialog,
  index,
}: {
  dialog: Dialog;
  index: number;
}) => {
  const [open, setOpen] = useState(false);
  const dialogStore = useDialogStore();

  const Dialog = dialog.component;

  function onClose() {
    dialog.options?.onClose?.();
    dialogStore.closeById(dialog.id);
  }

  function onOpenChange(open: boolean) {
    setOpen(open);
    dialogStore.closeById(dialog.id);
  }

  useEffect(() => {
    setTimeout(() => {
      setOpen(true);
    }, 0);
  }, []);

  return (
    <DialogContext.Provider
      value={{
        open,
        onClose,
        onOpenChange,
        zIndex: 300 + index,
      }}
    >
      <Dialog {...dialog.props} />
    </DialogContext.Provider>
  );
};

export const DialogProvider = () => {
  const dialogs = useDialogStore((state) => state.dialogs);
  return (
    <>
      {dialogs.map((dialog, i) => (
        <React.Fragment key={dialog.id.toString()}>
          <DialogProviderInner dialog={dialog} index={i} />
        </React.Fragment>
      ))}
    </>
  );
};
