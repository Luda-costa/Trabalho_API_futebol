import { Link } from 'react-router-dom';
import { ArrowIcon, BallIcon, StarIcon } from '../components/Icons.jsx';

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><span /> Futebol sem ruído</span>
            <h1>O jogo inteiro,<br /><em>em um só lugar.</em></h1>
            <p>Acompanhe campeonatos, explore seus times e consulte partidas com uma experiência rápida e direta.</p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/campeonatos">Explorar campeonatos <ArrowIcon /></Link>
              <Link className="button button-light" to="/partidas">Ver partidas</Link>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="pitch-card">
              <div className="pitch-lines"><span className="pitch-circle" /></div>
              <div className="floating-score score-top"><small>HOJE · 16:00</small><strong>ARS <b>2</b> — <b>1</b> CHE</strong><span>Premier League</span></div>
              <div className="floating-score score-bottom"><small>PRÓXIMA PARTIDA</small><strong>RMA <b>vs</b> BAR</strong><span>La Liga</span></div>
              <div className="big-ball"><BallIcon size={112} /></div>
            </div>
          </div>
        </div>
      </section>
      <section className="feature-strip">
        <div className="container feature-grid">
          <article><span className="feature-number">01</span><div><h3>Campeonatos</h3><p>Ligas nacionais e torneios internacionais.</p></div></article>
          <article><span className="feature-number">02</span><div><h3>Partidas</h3><p>Datas, placares e confrontos atualizados.</p></div></article>
          <article><span className="feature-number"><StarIcon size={28} /></span><div><h3>Seus favoritos</h3><p>Guarde os times e campeonatos que importam.</p></div></article>
        </div>
      </section>
      <section className="home-cta section">
        <div className="container cta-card">
          <div><span className="eyebrow dark"><span /> Sua central esportiva</span><h2>Comece pelos grandes campeonatos.</h2></div>
          <Link className="circle-link" to="/campeonatos" aria-label="Abrir campeonatos"><ArrowIcon size={30} /></Link>
        </div>
      </section>
    </>
  );
}
