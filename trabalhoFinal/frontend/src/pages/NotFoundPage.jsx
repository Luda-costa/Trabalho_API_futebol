import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return <section className="not-found"><span>404</span><h1>Essa jogada não existe.</h1><p>A página que você procura saiu de campo.</p><Link className="button button-primary" to="/">Voltar ao início</Link></section>;
}
