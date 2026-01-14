import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type DialogProps<TProps> =
  TProps extends Record<string, never>
    ? { props?: TProps }
    : TProps extends unknown
      ? { props?: TProps }
      : { props: TProps };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DialogSettings<TProps = any> = {
  id?: string | number | symbol;
  component: React.ComponentType<TProps>;
  type?: "dialog" | "routed-dialog";
  options?: {
    transitionDuration?: number;
    onClose?: () => void;
  };
} & DialogProps<TProps>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dialog<TProps = any> = DialogSettings<TProps> & {
  id: string | number | symbol;
};

type DialogStore = {
  dialogs: Dialog[];
  trigger: <TProps>(args: DialogSettings<TProps>) => void;
  toggle: <TProps>(args: Dialog<TProps>) => void;
  closeById: (id: string | number | symbol) => void;
  closeLatest: () => void;
  closeAll: () => void;
};

export const useDialogStore = create<DialogStore>()(
  immer((set, get) => ({
    dialogs: [],
    trigger: (args) => {
      const dialog: Dialog = {
        component: args.component,
        props: args.props,
        options: args.options,
        id: args.id ?? Date.now(),
        type: args.type ?? "dialog",
      };
      set((state) => {
        const exists =
          state.dialogs.findIndex((x: Dialog) => x.id === dialog.id) > -1;
        if (!exists) {
          return {
            dialogs: [...state.dialogs, dialog],
          };
        }
      });
    },
    toggle: (args) => {
      const { trigger, dialogs, closeById } = get();
      const exists = dialogs.findIndex((x) => x.id === args.id) > -1;
      if (!exists) trigger(args as Dialog);
      else closeById(args.id);
    },
    closeById: (id) =>
      set((state) => {
        state.dialogs = state.dialogs.filter((x: Dialog) => x.id !== id);
      }),
    closeLatest: () =>
      set((state) => {
        state.dialogs.pop();
      }),
    closeAll: () =>
      set({
        dialogs: [],
      }),
  })),
);

export const dialogStore = useDialogStore.getState();
