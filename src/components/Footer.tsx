import { PropsWithChildren } from 'react'

const InstagramIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    role="img"
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="currentColor"
      d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.75 2.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
    />
  </svg>
)

const FooterLink = ({ href, children }: PropsWithChildren<{ href: string }>) => (
  <a className="site-footer__link" href={href}>
    {children}
  </a>
)

const Footer = () => {
  const instagramUrl = 'https://www.instagram.com/'

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <div className="site-footer__brand-icon">
            <InstagramIcon />
          </div>
          <h2 className="site-footer__title">Cultive ton equilibre comme dans ton Planner.</h2>
        </div>

        <div className="site-footer__sections" aria-label="Navigation complementaire">
          <div className="site-footer__section">
            <h3 className="site-footer__section-title">A propos</h3>
            <FooterLink href="#apropos">A propos de moi</FooterLink>
            <FooterLink href="#faq">FAQ</FooterLink>
            <FooterLink href="#contact">Contacte-moi</FooterLink>
          </div>

          <div className="site-footer__section">
            <h3 className="site-footer__section-title">Infos</h3>
            <FooterLink href="#mentions-legales">Mentions legales</FooterLink>
            <FooterLink href="#cookies">Gestion des cookies</FooterLink>
            <FooterLink href="#confidentialite">Politique de confidentialite</FooterLink>
          </div>

          <div className="site-footer__section">
            <h3 className="site-footer__section-title">Suis-moi</h3>
            <a className="site-footer__social-link" href={instagramUrl} target="_blank" rel="noreferrer noopener">
              <InstagramIcon className="site-footer__social-icon" />
              Instagram
            </a>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">Propulse ta journee - garde l'equilibre entre ambition et serenite.</div>
    </footer>
  )
}

export default Footer
