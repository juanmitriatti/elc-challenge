import { buttonVariants } from '@/components/ui/button';
import { Location } from '@/lib/models/location';
import { VariantProps } from 'class-variance-authority';
import { Dispatch, SetStateAction, createContext, useContext, useState } from 'react';

type DismissType = 'dismiss' | 'confirm' | 'deny';
type AlertType = 'info' | 'success' | 'warning' | 'error';
type Alert = {
  title: string | JSX.Element;
  message?: string | JSX.Element;
  canDismiss?: boolean;
  confirmText?: string;
  denyText?: string;
  icon?: JSX.Element;
  containerClass?: string;
  confirmButtonVariant?: VariantProps<typeof buttonVariants>['variant'];
  denyButtonVariant?: VariantProps<typeof buttonVariants>['variant'];
  onDismiss?: ((type: DismissType) => void) | null;
};

type AlertState = Alert & {
  show: boolean;
  type: AlertType;
};

type LoadingState = {
  show: boolean;
  title: string;
  position: 'center' | 'bottom';
};

const initialLoadingState: LoadingState = {
  show: false,
  title: 'Cargando...',
  position: 'center',
};

const initialAlertState: AlertState = {
  show: false,
  type: 'info',
  title: '',
  message: '',
  canDismiss: true,
};

type ShowLoading = {
  (): void;
  (title: string, options?: Omit<LoadingOptions, 'title'>): void;
  (options: LoadingOptions): void;
};

type LoadingOptions = {
  title: string;
  hideOverlay?: boolean;
  position: 'center' | 'bottom';
};

const StateContext = createContext<{
  map: google.maps.Map | undefined;
  setMap: Dispatch<SetStateAction<google.maps.Map | undefined>>;
  location: Location | undefined;
  setLocation: Dispatch<SetStateAction<Location | undefined>>;
  loading: LoadingState;
  showLoading: ShowLoading;
  hideLoading: () => void;
  alert: AlertState;
  showAlert: (state: Alert & { type: AlertType }) => void;
  hideAlert: () => void;
}>({
  map: undefined,
  setMap: () => {},
  location: undefined,
  setLocation: () => {},
  loading: initialLoadingState,
  showLoading: () => {},
  hideLoading: () => {},
  alert: initialAlertState,
  showAlert: () => {},
  hideAlert: () => {},
});

export const StateProvider = ({ children }: { children: React.ReactNode }) => {
  const [map, setMap] = useState<google.maps.Map>();
  const [location, setLocation] = useState<Location>();
  const [loading, setLoadingState] = useState<LoadingState>(initialLoadingState);
  const [alert, setAlert] = useState<AlertState>(initialAlertState);

  const showLoading: ShowLoading = (
    param1?: string | LoadingOptions,
    param2?: Omit<LoadingOptions, 'title'>,
  ) => {
    if (!param1) {
      setLoadingState({ show: true, title: 'Cargando...', position: 'center' });
    } else if (typeof param1 === 'string') {
      setLoadingState({
        show: true,
        title: param1,
        position: param2?.position || 'center',
      });
    } else {
      setLoadingState({
        show: true,
        title: param1.title,
        position: param1.position || 'center',
      });
    }
  };

  const hideLoading = () => setLoadingState((state) => ({ ...state, show: false }));

  const showAlert = (state: Alert & { type: AlertType }) =>
    setAlert({ ...state, canDismiss: state.canDismiss ?? true, show: true });

  const hideAlert = () => setAlert((state) => ({ ...state, onDismiss: null, show: false }));

  const value = {
    map,
    setMap,
    location,
    loading,
    setLocation,
    showLoading,
    hideLoading,
    alert,
    showAlert,
    hideAlert,
  };

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
};

export const useStateContext = () => {
  const context = useContext(StateContext);

  if (!context) {
    throw new Error('useStateContext must be used within StateProvider');
  }

  return context;
};
