import { Navigate } from 'react-router-dom';

/** Eski satıcı kayıt URL'si → ortak kayıt portalı */
export default function VendorApplyPage() {
  return <Navigate to="/kayit?portal=satici" replace />;
}
