import { useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';

/**
 * Roteamento por hash (#/modulo/1.1). Funciona em hospedagem estática (GitHub Pages)
 * sem configuração de servidor e sem dependências extras.
 */
export function currentPath(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h.startsWith('/') ? h : '/';
}

export function useRoute(): { path: string; segments: string[] } {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const on = () => setPath(currentPath());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return { path, segments: path.split('/').filter(Boolean).map(decodeURIComponent) };
}

export function navigate(to: string) {
  if (currentPath() !== to) window.location.hash = to;
}

export function Link({ to, children, ...rest }: { to: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <a href={`#${to}`} {...rest}>
      {children}
    </a>
  );
}
