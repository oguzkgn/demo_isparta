export function musteriYonlendir(navigate) {
  navigate('/');
}

export function saticiYonlendir(kullanici, navigate) {
  if (['satici', 'admin'].includes(kullanici?.rol)) {
    navigate('/satici/panel');
  } else {
    navigate('/satici/basvuru');
  }
}
