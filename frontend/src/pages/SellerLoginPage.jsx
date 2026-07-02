import { Navigate, useSearchParams } from 'react-router-dom';

/** Eski satıcı giriş URL'si → ortak giriş portalı */
export default function SellerLoginPage() {
  const [params] = useSearchParams();
  const portal = params.get('portal') || 'satici';
  return <Navigate to={`/giris?portal=${portal}`} replace />;
}
